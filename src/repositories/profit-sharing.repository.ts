import { DynamoService, generateId } from '@ekonoo/backend-common';
import { Logger, Service } from '@ekonoo/lambdi';
import { Molder } from '@ekonoo/models';

import { OperationStateEvent, OperationStateEventDB } from '../models/events/operation.model';
import { ProfitSharingDB, ProfitSharingInitEvent } from '../models/events/profit-sharing.model';
import { WalletItem, WalletItemDB } from '../models/wallet.model';

@Service({
    providers: []
})
export class ProfitSharingRepository {
    private readonly tableName = process.env.PROFIT_SHARE_TABLE || 'profitSharingTable';
    protected profitSharingPK = 'PROFITSHARING';
    protected totalPurchasePK = 'TOTALPURCHASE';
    constructor(protected readonly logger: Logger, private readonly dynamoClient: DynamoService) {}

    async storePB(ev: ProfitSharingInitEvent): Promise<boolean> {
        const pb = Molder.instantiate(ProfitSharingDB, {
            ...ev,
            PK: `${this.profitSharingPK}#${ev.year}`,
            SK: `DETAIL#`,
            created_date: Date.now(),
            updated_date: Date.now()
        } as ProfitSharingDB);
        this.logger.info(`Storing PB`, { pb });
        return this.dynamoClient.insert(this.tableName, this.profitSharingPK, pb).then(() => true);
    }

    async storeWalletItems(w_items: WalletItem[], year: number, is_total_purchase: boolean): Promise<boolean> {
        const items = w_items.map(i =>
            Molder.instantiate(WalletItemDB, {
                ...i,
                PK: `${this.profitSharingPK}#${year}`,
                SK: `${i.individual_id}#${i.instruction_id}`,
                db_id: i.db_id || i.instruction_id, // generateId('PB')(),
                is_total_purchase,
                year
            } as WalletItemDB)
        );
        this.logger.info(`Storing wallet`, { items });
        for (let i = 0; i < items.length; i += 25) {
            await this.dynamoClient.putBatch(this.tableName, items.slice(i, i + 25)).then(() => true);
        }
        return true;
    }

    async getInfoPB(year: number): Promise<ProfitSharingInitEvent | null> {
        return this.dynamoClient.fetchRow(this.tableName, {
            PK: `${this.profitSharingPK}#${year}`,
            SK: `DETAIL#`
        });
    }

    async storeTotalPurchaseEvent(ev: OperationStateEvent): Promise<boolean> {
        const item = Molder.instantiate(OperationStateEventDB, {
            ...ev,
            PK: this.totalPurchasePK,
            SK: `DETAIL#${ev.operation.origin.individual_id}`,
            status: 'PENDING' // this is the gsi
        } as OperationStateEventDB);
        this.logger.info(`Storing total purchase event`, { item });
        return this.dynamoClient.insert(this.tableName, this.totalPurchasePK, item).then(() => true);
    }

    async getTotalPurchases(): Promise<OperationStateEventDB[] | undefined> {
        this.logger.info(`Getting the total purchases`);
        return this.dynamoClient
            .fetchRows<OperationStateEventDB>({
                TableName: this.tableName,
                IndexName: 'GSI1',
                KeyConditionExpression: '#status = :status',
                ExpressionAttributeNames: {
                    '#status': 'status'
                },
                ExpressionAttributeValues: {
                    ':status': 'PENDING'
                }
            })
            .then(data => (data.length ? data : undefined));
    }

    async deleteTotalPurchase(ev: OperationStateEvent): Promise<boolean> {
        this.logger.info(`Getting the total purchases`);
        return this.dynamoClient
            .deleteItem(this.tableName, { PK: this.totalPurchasePK, SK: `DETAIL#${ev.operation.origin.individual_id}` })
            .then(_ => true);
    }
}
