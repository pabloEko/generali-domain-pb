import { AthenaResult } from '@ekonoo/backend-common/services/datalake.service';
import { Event, generateHandler, Lambda, Logger } from '@ekonoo/lambdi';
import { Molder } from '@ekonoo/models';

import { context_annual_pb } from '../../../../test/pb/vars';
import { ContextProfitSharing, WalletOperations } from '../../../models/events/profit-sharing.model';
import { DatalakeSvc } from '../../../services/datalake.service';
import { ProfitSharingService } from '../../../services/profit-sharing.service';

@Lambda({
    providers: [ProfitSharingService, DatalakeSvc]
})

// this lambda will receive the info of the users and will process and calcul the pb for each user
export class ProcessLambda {
    constructor(
        private readonly logger: Logger,
        private readonly profitSharing: ProfitSharingService,
        private readonly datalakeService: DatalakeSvc
    ) {}

    async onHandler(@Event event: ContextProfitSharing): Promise<ContextProfitSharing> {
        this.logger.info({
            msg: 'Step of procesing',
            event
        });
        return this.datalakeService
            .getQueryResults(event.athenaResult as AthenaResult, WalletOperations)
            .then(data =>
                Molder.instantiate(ContextProfitSharing, {
                    ...event,
                    // keep athenaResult updated
                    athenaResult: {
                        QueryExecutionId: event.athenaResult?.QueryExecutionId,
                        NextToken: data?.nextToken || null
                    },
                    // set the response into the payload
                    payload: data?.data.filter(i => i.items?.length)
                })
            )
            .then(async context => (context.payload?.length ? this.profitSharing.process(context) : context));
    }
}

export const handler = generateHandler(ProcessLambda);
