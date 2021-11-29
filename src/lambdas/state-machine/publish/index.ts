import { Event, generateHandler, Lambda, Logger } from '@ekonoo/lambdi';

import { ContextProfitSharing, WorkflowType } from '../../../models/events/profit-sharing.model';
import { WalletItem } from '../../../models/wallet.model';
import { ProfitSharingService } from '../../../services/profit-sharing.service';

@Lambda({
    providers: [ProfitSharingService]
})

// this lambda will receive the pb, store in db and publish it (to wallet)
export class PublishLambda {
    constructor(private readonly logger: Logger, private readonly pbService: ProfitSharingService) {}

    async onHandler(@Event event: ContextProfitSharing): Promise<ContextProfitSharing> {
        this.logger.info({
            msg: 'Step of convert into wallet items and publish.',
            event
        });
        const type = 'executed';
        const source = 'generali-pb';
        let entity = 'annual-pb';
        if (event.workflow_type === WorkflowType.TOTAL_PURCHASE) entity = 'total-purchase';
        // maybe there is nothing to calcul so we will not have items for the pb
        if (!event.wallet_items?.length) {
            this.logger.info({
                msg: `No wallet items to publish`
            });
            // error we must have new wallet items for the pb because we have wallet operations
            if (event.payload?.length) {
                this.logger.error({ msg: 'Something went wrong processing the profit sharing.' });
                throw new Error(`Strange error, we have operations but not new wallet items`);
            }
            return event;
        }
        // store in dynamo and publish event to wallet or financial flow
        return this.pbService
            .storeWalletItems(event.wallet_items, event.year, event.workflow_type === WorkflowType.TOTAL_PURCHASE)
            .then(async () =>
                // we only publish the event to wallet in case of annual calcul of profit sharing
                // in case of a total purchase TODO: publish event to financial flow to generate a payout
                this.pbService.publish(event.wallet_items as WalletItem[], type, source, entity).then(() => event)
            );
    }
}

export const handler = generateHandler(PublishLambda);
