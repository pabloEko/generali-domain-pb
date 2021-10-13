import { ApiResponse, Event, generateHandler, Lambda, Logger } from '@ekonoo/lambdi';
import { SQSEvent } from 'aws-lambda';

import { Dummy } from '../../models/dummy.model';
import { DummyService } from '../../services/dummy.service';

@Lambda({
    providers: [DummyService]
})
export class DummyResourceLambda {
    constructor(private readonly dummyService: DummyService, private readonly logger: Logger) {}
    /**
     * Receive a SQSEvent event
     *
     * Call the dummy service
     *
     * @param event SQSEvent
     */
    @ApiResponse(Dummy)
    async onHandler(@Event event: SQSEvent): Promise<Dummy> {
        this.logger.debug({ msg: 'Was triggered with event', event: event });
        return this.dummyService.foo();
    }
}

export const handler = generateHandler(DummyResourceLambda);
