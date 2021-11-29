/* eslint-disable jest/no-conditional-expect */
import { DynamoService, EventBridgeService } from '@ekonoo/backend-common';
import { EventBridge } from 'aws-sdk';

import { ProfitSharingRepository } from '../../src/repositories/profit-sharing.repository';
import { ProfitSharingService } from '../../src/services/profit-sharing.service';
import { context_annual_pb, context_total_purchase_pb } from './vars';

const logger = { debug: () => 0, info: (i: any) => console.log(i) } as any;

describe('Test the calcul of the pb', () => {
    test('Process the wallet items of annual flow', async () => {
        const pbSvc = new ProfitSharingService(
            logger,
            new EventBridgeService(new EventBridge(), logger),
            new ProfitSharingRepository(logger, new DynamoService(logger))
        );
        const res = await pbSvc.process(context_annual_pb);

        res.wallet_items && expect(res?.wallet_items[0]?.quantity).toStrictEqual(118.43);
        res.wallet_items && expect(res?.wallet_items[1]?.quantity).toStrictEqual(0);
        res.wallet_items && expect(res?.wallet_items[2]?.quantity).toStrictEqual(1.5);
        res.wallet_items && expect(res?.wallet_items[3]?.quantity).toStrictEqual(119.95);
    });

    test('Process the wallet items of total purchase flow', async () => {
        const pbSvc = new ProfitSharingService(
            logger,
            new EventBridgeService(new EventBridge(), logger),
            new ProfitSharingRepository(logger, new DynamoService(logger))
        );
        const res = await pbSvc.process(context_total_purchase_pb);

        res.wallet_items && expect(res?.wallet_items[0]?.quantity).toStrictEqual(67.84);
        res.wallet_items && expect(res?.wallet_items[1]?.quantity).toStrictEqual(68.83);
        res.wallet_items && expect(res?.wallet_items[2]?.quantity).toStrictEqual(0.87);
    });
});
