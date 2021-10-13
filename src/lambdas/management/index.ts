import { ManagementHandler } from '@ekonoo/ekonoo-management-lib';
import { Event, generateHandler, Lambda, SQSRecord } from '@ekonoo/lambdi';
import { EventBridgeEvent } from 'aws-lambda';

import { MANAGEMENT_PROVIDERS } from '../../management';

@Lambda({
    providers: [...MANAGEMENT_PROVIDERS]
})
export class ManagementLambda {
    constructor(private readonly manager: ManagementHandler) {}

    @SQSRecord()
    async onHandler(@Event sqsEvent: EventBridgeEvent<any, any>): Promise<any> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
        return this.manager.handle(sqsEvent);
    }
}

export const handler = generateHandler(ManagementLambda);
