import { Event, generateHandler, Lambda, Logger, SQSRecord } from '@ekonoo/lambdi';

import { ProfitSharingInitEvent } from '../../models/events/profit-sharing.model';
import { ProfitSharingService } from '../../services/profit-sharing.service';

@Lambda({
    providers: [ProfitSharingService]
})

// this lambda will receive the info about the pb to store it
export class InitializeProfitSharingLambda {
    constructor(private readonly logger: Logger, private readonly pbService: ProfitSharingService) {}

    @SQSRecord('detail')
    async onHandler(@Event event: ProfitSharingInitEvent): Promise<boolean> {
        this.logger.info({
            msg: 'Receive event to store the data of the pb.',
            event
        });
        this.pbService.checkValidEvent(event);
        return this.pbService.storePB(event);
    }
}

export const handler = generateHandler(InitializeProfitSharingLambda);
