/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ESCAPE_STRING_TOKEN, SqlQueryService } from '@ekonoo/backend-common';
import { Event, generateHandler, Lambda, Logger } from '@ekonoo/lambdi';
import { ScheduledEvent } from 'aws-lambda';
import { StepFunctions } from 'aws-sdk';
import { escape } from 'sqlstring';

import { WorkflowType } from '../../../models/events/profit-sharing.model';
import { DayjsService } from '../../../services/dayjs';
import { ProfitSharingService } from '../../../services/profit-sharing.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
let query = require('../../../sql/total_purchase_query.sql').default as string;

@Lambda({
    providers: [
        ProfitSharingService,
        DayjsService,
        SqlQueryService,
        {
            provide: ESCAPE_STRING_TOKEN,
            useValue: (s: string) => escape(s, true)
        }
    ]
})
export class SchedulerPurchaseOperation {
    constructor(
        private readonly logger: Logger,
        private readonly pbService: ProfitSharingService,
        private readonly dayjsService: DayjsService,
        private readonly stepFunction: StepFunctions,
        private readonly sqlService: SqlQueryService
    ) {}

    async onHandler(@Event _: ScheduledEvent): Promise<boolean> {
        this.logger.info({
            msg: 'Scheduler for getting the total purchase and calcul the profit sharing'
        });
        // scheduler to get items of total purchase and start the calcul

        // if total purchase, we need to:
        // get the info of the profit sharing from dynamo
        return this.pbService.getInfoPB(new Date().getFullYear() - 1).then(async pb => {
            this.logger.info({
                msg: `PB retrieved: `,
                pb
            });
            if (!pb) {
                throw new Error(`Missing profit sharing info for year ${new Date().getFullYear() - 1}`);
            }
            return this.pbService.getTotalPurchases().then(async data => {
                if (!data) {
                    this.logger.info(`No total purchases to calcul the profit sharing`);
                    return Promise.resolve(false);
                }
                return Promise.all(
                    data?.map(async d => {
                        // we set the params for the specific user
                        query = this.sqlService.replace(query, {
                            individual_id: d.operation.origin.individual_id,
                            deal_id: d.operation.origin.deal_id,
                            start_date: this.dayjsService.getInitDate(pb.year),
                            end_date: this.dayjsService.getEndDate(pb.year),
                            euro_fund: pb.isins
                        });

                        // we start a stepfunction for the calculation of the profit sharing per operation/user
                        return this.stepFunction
                            .startExecution({
                                stateMachineArn: process.env.STATE_MACHINE_ARN || '',
                                input: JSON.stringify(
                                    this.pbService.createContext(pb, query, WorkflowType.TOTAL_PURCHASE)
                                )
                            })
                            .promise()
                            .then(async _ => this.pbService.deleteTotalPurchase(d));
                    })
                ).then(_ => true);
            });
        });
    }
}

export const handler = generateHandler(SchedulerPurchaseOperation);
