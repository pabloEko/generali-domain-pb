import 'dayjs/locale/fr'; // import locale

import { EventBridgeService, generateId } from '@ekonoo/backend-common';
import { Logger, Service } from '@ekonoo/lambdi';
import { Molder } from '@ekonoo/models';
import dayjs from 'dayjs';
// import plugin
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { PurposeType } from '../models/common/constants';
import { OperationStateEvent, OperationStateEventDB } from '../models/events/operation.model';
import {
    ContextProfitSharing,
    MappingPurchasePurpose,
    ProfitSharingInitEvent,
    RateExitReason,
    WalletOperations,
    WorkflowType
} from '../models/events/profit-sharing.model';
import { WalletItem } from '../models/wallet.model';
import { ProfitSharingRepository } from '../repositories/profit-sharing.repository';
// import { ProfitSharingRepository } from '../repositories/profit-sharing.repository';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs().tz('Europe/Paris');

dayjs.extend(isLeapYear);
dayjs.extend(customParseFormat);

@Service({
    providers: [ProfitSharingRepository]
})
export class ProfitSharingService {
    constructor(
        private readonly logger: Logger,
        private readonly evBridgeService: EventBridgeService,
        private readonly profitSharingRepo: ProfitSharingRepository
    ) {}

    checkValidEvent(event: ProfitSharingInitEvent): void {
        if (event.year !== new Date().getFullYear() - 1) {
            // must always be for the year before
            throw new Error(
                `The year: ${event.year} is not valid as is different from ${new Date().getFullYear() - 1}`
            );
        }
        if (!event.profit_share_net) {
            // this will be calculated in euro fund domain
            throw new Error(`Missing param in the event, the profit sharing net must be communicated.`);
        }
        if (!event.isins?.length) {
            throw new Error(`Missing param in the event, no isins.`);
        }
        if (event.profit_share_gross < event.technical_rate) {
            throw new Error(
                `The gross profit share: ${event.profit_share_gross} is less than the technical rate: ${event.technical_rate}. This is not possible. Please review the values.`
            );
        }
    }

    async storePB(ev: ProfitSharingInitEvent): Promise<boolean> {
        return this.profitSharingRepo.storePB(ev);
    }

    async storeWalletItems(items: WalletItem[], year: number, is_total_purchase: boolean): Promise<boolean> {
        return this.profitSharingRepo.storeWalletItems(items, year, is_total_purchase);
    }

    createContext(event: ProfitSharingInitEvent, query: string, type: WorkflowType): ContextProfitSharing {
        return Molder.instantiate(ContextProfitSharing, {
            ...event,
            workflow_type: type,
            query
        } as ContextProfitSharing);
    }

    async getInfoPB(year: number): Promise<ProfitSharingInitEvent | null> {
        return this.profitSharingRepo.getInfoPB(year);
    }

    async storeTotalPurchaseEvent(ev: OperationStateEvent): Promise<boolean> {
        return this.profitSharingRepo.storeTotalPurchaseEvent(ev);
    }

    async getTotalPurchases(): Promise<OperationStateEventDB[] | undefined> {
        return this.profitSharingRepo.getTotalPurchases();
    }

    async deleteTotalPurchase(ev: OperationStateEvent): Promise<boolean> {
        return this.profitSharingRepo.deleteTotalPurchase(ev);
    }

    async process(context: ContextProfitSharing): Promise<ContextProfitSharing> {
        // if the timezone needs to be changed
        if (context.timezone && dayjs().tz(context.timezone).isValid()) {
            dayjs().tz(context.timezone);
        }
        return {
            ...context,
            wallet_items: await Promise.all(
                (context.payload as WalletOperations[]).map(async wallet_ops => {
                    // if the user has made a total purchase before we need to filter the items to have the good elements between each total purchase
                    wallet_ops.items = this.filterOperations(wallet_ops.items).sort(
                        (a, b) => (a.created_date as number) - (b.created_date as number) // need to have the item in order from the oldest created to the newest
                    );
                    let start_date: any;
                    let end_date: any;
                    let purchase_purpose: PurposeType | undefined;

                    // if its a total purchase, dates changes
                    if (context.workflow_type === WorkflowType.TOTAL_PURCHASE) {
                        const { end, start } = this.getTotalPurchaseDates(
                            wallet_ops.items,
                            wallet_ops.sum_quantity !== 0
                        );
                        start_date = start;
                        end_date = end;

                        // we dont calcul the pb for the last item (the total purchase)
                        const last_item = wallet_ops.items.pop();
                        // but we need the purchase purpose to apply the correct % of pb
                        purchase_purpose = last_item?.purchase_purpose;
                    }

                    const guarantee = wallet_ops.is_guarantee_enabled ? Number(wallet_ops.guarantee) : 0;
                    const totalQt = this.round(
                        wallet_ops.items
                            .map(it =>
                                this.calculPbForItem(
                                    context,
                                    it,
                                    guarantee,
                                    context.workflow_type === WorkflowType.TOTAL_PURCHASE,
                                    end_date,
                                    start_date,
                                    purchase_purpose
                                )
                            )
                            .reduce((acc, val) => acc + val, 0) +
                            this.calculPbForInitQt(
                                context,
                                wallet_ops.sum_quantity || 0,
                                guarantee,
                                context.workflow_type === WorkflowType.TOTAL_PURCHASE,
                                end_date,
                                start_date,
                                purchase_purpose
                            ),
                        2
                    );

                    return this.createProfitShareWalletItem(
                        wallet_ops,
                        context,
                        wallet_ops.items[wallet_ops.items.length - 1],
                        totalQt
                    );
                })
            )
        };
    }

    // this is a little algo put in place for in case of multiples total purchase in one year
    private filterOperations(items: WalletItem[] | undefined): WalletItem[] {
        const ops: WalletItem[] = [];
        if (!items || !items?.length) {
            return [];
        }
        ops.push(items[items.length - 1]); // we always add the last item
        // we only want the group of operations between total purchases (in case there is more than 1), we need to do this
        for (let i = items.length - 2; i > -1; i--) {
            if (!items[i]?.is_total_purchase) {
                ops.push(items[i]);
            } else {
                break;
            }
        }
        // we reverse because we add from the last to the first
        return ops.reverse();
    }

    private getTotalPurchaseDates(
        items: WalletItem[],
        is_initial_qt?: boolean
    ): { end: dayjs.Dayjs; start: dayjs.Dayjs } {
        let d = new Date(items[items.length - 1].created_date as number);
        let day = d.getDate();
        let month = d.getMonth() + 1;
        let y = d.getFullYear();
        const end = dayjs(`${y}-${month}-${day}`).endOf('day');

        d = new Date(items[0].created_date as number);
        day = d.getDate();
        month = d.getMonth() + 1;
        y = d.getFullYear();
        const start = is_initial_qt ? dayjs(`${y}-01-01`).startOf('day') : dayjs(`${y}-${month}-${day}`).startOf('day');
        return { end, start };
    }

    private async createProfitShareWalletItem(
        ops: WalletOperations,
        context: ContextProfitSharing,
        lastItem: WalletItem | undefined,
        totalQt: number
    ): Promise<WalletItem> {
        this.logger.info({
            msg: 'Created new item for the profit sharing: ',
            lastItem,
            totalQt
        });
        return Promise.resolve({
            ...lastItem,
            individual_id: ops.individual_id,
            deal_id: ops.deal_id,
            instruction_id: generateId('PB')(), // lastItem.db_id as string,
            operation_type: 'PB', // TODO CHECK
            compartment: ops.compartment,
            product: lastItem?.product || 'PER',
            fund: lastItem?.fund || context.isins.join(','),
            quantity: totalQt,
            price: 1,
            currency: lastItem?.currency || 'EUR',
            pru_financial: 0,
            pru_tax: 0,
            purchase_provision: 0,
            purchase_used: 0,
            created_date: Date.now(),
            updated_date: Date.now(),
            executed_order_date: Date.now()
        });
    }

    // we calcul the pb for the start quantity the user have at date 01-01-YYYY
    // if its a total purchase we never calcul the pb of the starter qt
    private calculPbForInitQt(
        ev: ProfitSharingInitEvent,
        quantity: number,
        guarantee: number,
        is_total_purchase: boolean,
        end_date: dayjs.Dayjs,
        start_date: dayjs.Dayjs,
        purchase_purpose: PurposeType | undefined
    ): number {
        if (is_total_purchase) {
            return this.pbForTotalPurchase(ev, quantity, guarantee, end_date, start_date, undefined, purchase_purpose);
            // return (
            //     quantity *
            //     (Math.pow(
            //         1 + ((ev.rate_reasons[reason] as number) * ev.profit_share_net - guarantee) / 100,
            //         this.proratedDuration(start_date.valueOf(), ev.year, end_date, start_date)
            //     ) -
            //         1)
            // );
        }
        return (
            quantity *
            (Math.pow(
                1 + (ev.profit_share_net - guarantee) / 100,
                this.proratedDuration(new Date(`01-01-${ev.year}`).getTime(), ev.year)
            ) -
                1)
        );
    }

    private calculPbForItem(
        ev: ProfitSharingInitEvent,
        item: WalletItem,
        guarantee: number,
        is_total_purchase: boolean,
        end_date: dayjs.Dayjs,
        start_date: dayjs.Dayjs,
        purchase_purpose: PurposeType | undefined
    ): number {
        this.logger.info({
            msg: 'Calculation of the qt for the item',
            item,
            guarantee,
            is_total_purchase,
            end_date,
            start_date
        });
        // we need to check if its a total purchase
        if (is_total_purchase) {
            return this.pbForTotalPurchase(ev, item.quantity, guarantee, end_date, undefined, item, purchase_purpose);
            // return (
            //     item.quantity *
            //     (Math.pow(
            //         1 + ((ev.rate_reasons[reason] as number) * ev.profit_share_net - guarantee) / 100,
            //         this.proratedDuration(item.created_date as number, ev.year, end_date)
            //     ) -
            //         1)
            // );
        }

        return (
            item.quantity *
            (Math.pow(
                1 + (ev.profit_share_net - guarantee) / 100,
                this.proratedDuration(item.created_date as number, ev.year)
            ) -
                1)
        );
    }

    private pbForTotalPurchase(
        ev: ProfitSharingInitEvent,
        quantity: number,
        guarantee: number,
        end_date: dayjs.Dayjs,
        start_date?: dayjs.Dayjs,
        item?: WalletItem,
        purchase_purpose?: PurposeType | undefined
    ): number {
        if (!purchase_purpose) {
            throw new Error(`Total purchase detected but dont have a purchase purpose`);
        }
        const reason = Object.entries(MappingPurchasePurpose).find(([k, _]) => k === purchase_purpose)?.[1];
        if (!reason || !ev.rate_reasons[reason]) {
            throw new Error(`Dont have any mapping between the purchase purpose and our exit reason`);
        }
        return (
            quantity *
            (Math.pow(
                1 + ((ev.rate_reasons[reason] as number) * ev.profit_share_net - guarantee) / 100,
                this.proratedDuration(
                    start_date?.valueOf() || ((item as WalletItem).created_date as number),
                    ev.year,
                    end_date,
                    start_date
                )
            ) -
                1)
        );
    }

    private proratedDuration(
        created_date: number,
        year: number,
        end_date?: dayjs.Dayjs,
        start_date?: dayjs.Dayjs
    ): number {
        // created_date is a timestamp
        const new_date = new Date(created_date);
        const day = new_date.getDate();
        const month = new_date.getMonth() + 1;
        const y = new_date.getFullYear();
        // no. of milliseconds in a day = (1000 * 60 * 60 * 24)
        const days_year = this.isLeap(new_date.getFullYear()) ? 366 : 365;
        // get the days from the date of the operation to the end of the year
        // and divided by the total days of the year, so we have the prorated duration of the operation
        const endDate = end_date || dayjs(`${year + 1}-01-01`).startOf('day');

        this.logger.info({
            msg: 'Calcul of prorrated duration: ',
            diff:
                endDate.diff(
                    start_date?.valueOf() || dayjs(`${y}-${month}-${day}`).startOf('day').valueOf(),
                    'day',
                    false
                ) / days_year
        });
        return (
            endDate.diff(
                start_date?.valueOf() || dayjs(`${y}-${month}-${day}`).startOf('day').valueOf(),
                'day',
                false
            ) / days_year
        );
    }

    round = (value: number, precision = 2): number =>
        Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);

    isLeap = (year: number): boolean => dayjs(`${year}-01-01`).isLeapYear(); // new Date(year, 1, 29).getDate() === 29;

    async publish(
        events: any[], // ProfitSharingFinishedEvent[],
        type: string,
        source: string,
        entity: string
    ): Promise<boolean> {
        this.logger.info({
            msg: 'Publishing events',
            events
        });
        return this.evBridgeService.publish(events, type, source, entity).then(_ => true);
    }

    // async getIndividualContext(individual_id: string): Promise<IndividualContext> {
    //     return this.elasticService.getIndividualContext(individual_id);
    // }

    // private getGuanrantee(context: IndividualContext): number {
    //     const guarantee = context.contracts
    //         .find(contract => contract.deal.products.PER?.guarantees?.find(g => g.type === GuaranteeType.FLOOR))
    //         ?.deal.products.PER?.guarantees?.find(g => g.type === GuaranteeType.FLOOR);
    //     const fee = guarantee?.fees.find(fee => fee.type === 'EURO');
    //     return guarantee?.is_enabled && fee ? fee?.value.value : 0;
    // }
}
