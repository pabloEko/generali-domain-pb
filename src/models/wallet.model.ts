import { Enum, ExtendRules, Required, Simple } from '@ekonoo/models';

import { PurposeType } from './common/constants';

export type CompartmentType = 'D_INDIVIDUAL' | 'INDIVIDUAL' | 'COLLECTIVE' | 'MANDATORY';

export class WalletItem {
    @Simple id?: number;
    @Required individual_id: string;

    @Required product: string;

    @Required deal_id: string;

    @Required instruction_id: string;
    @Required operation_type: string;
    @Required
    @Enum('D_INDIVIDUAL', 'INDIVIDUAL', 'COLLECTIVE', 'MANDATORY')
    compartment: CompartmentType;

    @Required fund: string;
    @Required quantity: number;
    @Required currency: string;
    @Required price: number;
    @Required pru_financial: number;
    @Required pru_tax: number;
    // @Required fees: number; // dropped
    @Required purchase_provision: number;
    @Required purchase_used: number;
    @Required executed_order_date: number;
    @Simple created_date?: number;
    @Simple updated_date?: number;

    @Simple is_total_purchase?: boolean;
    @Simple purchase_purpose?: PurposeType; // keyof RateExitReason;

    @Simple db_id?: string; // internal id for dynamo and for the instruction id
}

@ExtendRules(WalletItem)
export class WalletItemDB extends WalletItem {
    @Required PK: string;
    @Required SK: string;
    @Required year: number;
    // @Required id: string;
}
