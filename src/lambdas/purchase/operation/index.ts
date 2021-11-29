/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ESCAPE_STRING_TOKEN, SqlQueryService } from '@ekonoo/backend-common';
import { Event, generateHandler, Lambda, Logger, SQSRecord } from '@ekonoo/lambdi';
import { escape } from 'sqlstring';

import {
    OperationStateEvent,
    OperationStatus,
    OperationSubType,
    OperationType
} from '../../../models/events/operation.model';
import { DayjsService } from '../../../services/dayjs';
import { ProfitSharingService } from '../../../services/profit-sharing.service';

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
export class PurchaseOperation {
    constructor(private readonly logger: Logger, private readonly pbService: ProfitSharingService) {}

    @SQSRecord('detail')
    async onHandler(@Event event: OperationStateEvent): Promise<boolean> {
        this.logger.info({
            msg: 'Receive event from operation',
            event
        });
        // we check if all the instructions are totals purchase
        if (
            event.operation.type === OperationType.Purchase &&
            event.operation.status === OperationStatus.Executed &&
            event.operation.sub_type === OperationSubType.Individual &&
            !event.instructions.every(i => i.is_total_purchase)
        ) {
            this.logger.info({
                msg: 'It is not a total purchase'
            });
            return false;
        }
        return this.pbService.storeTotalPurchaseEvent(event);
    }
}

export const handler = generateHandler(PurchaseOperation);
