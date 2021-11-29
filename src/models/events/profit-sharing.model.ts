import { AthenaResult } from '@ekonoo/backend-common/services/datalake.service';
import { ExtendRules, Item, Required, Simple } from '@ekonoo/models';

import { CompartmentType, WalletItem } from '../wallet.model';

export enum WorkflowType {
    TOTAL_PURCHASE = 'TOTAL_PURCHASE',
    ANNUAL_PROFIT_SHARING = 'ANNUAL_PROFIT_SHARING'
}
export enum MappingPurchasePurpose {
    DISABILITY = 'authorize',
    OVER_INDEBTEDNESS = 'authorize',
    INSURANCE_RIGHT_EXPIRY = 'authorize',
    JUDICIAL_LIQUIDATION = 'authorize',
    PRINCIPAL_RESIDENCE_PURCHASE = 'authorize',
    RETIRED = 'term',
    DEATH = 'decease'
}
// export const MappingPurchasePurpose = {
//     DISABILITY: 'authorize',
//     OVER_INDEBTEDNESS: 'authorize',
//     INSURANCE_RIGHT_EXPIRY: 'authorize',
//     JUDICIAL_LIQUIDATION: 'authorize',
//     PRINCIPAL_RESIDENCE_PURCHASE: 'authorize',
//     RETIRED: 'term',
//     DEATH: 'decease'
// };

// HOUSE_CONSTRUCTION: 'Not Apply',
// RESIDENCE_WORK: 'Not Apply',
// RESIDENCE_EXPANSION: 'Not Apply',
// CIVIL_MARRIAGE: 'Not Apply', // MARIAGE, PACS
// DIVORCED: 'Not Apply', // PACS with 1 child
// BIRTH: 'Not Apply', // BIRTH or ADOPTION
// DEADLINE: 'Not Apply',
// DOMESTIC_VIOLENCE: 'Not Apply',
// BUSINESS_CREATION: 'Not Apply',
// CESSATION_OF_ACTIVITY: 'Not Apply'
// };

export class RateExitReason {
    @Simple authorize?: number;
    @Simple decease?: number;
    @Simple term?: number;
    @Simple exit_transfer?: number;
}

// model of the returned query
export class WalletOperations {
    individual_id: string;
    deal_id: string;
    compartment: CompartmentType;
    sum_quantity: number; // the qt at the begining of the year
    items?: WalletItem[]; // the operations during the year
    guarantee: number | string;
    is_guarantee_enabled: boolean;
}

// event coming from euro fund to start the calculation of the pb
export class ProfitSharingInitEvent {
    @Required event_type: string; // 'PROFIT_SHARE_INIT' ?
    @Required profit_share_gross: number;
    @Required management_fees: number;
    @Required technical_rate: number;
    @Required year: number;
    @Required rate_reasons: RateExitReason;

    @Required profit_share_net: number; //  // the profit share of the year - 1

    @Required @Item(String) isins: string[];
    @Simple timezone?: string;
    @Simple provider?: string; // sponsor
}

// to send an event when we have calculated the pb
export class ProfitSharingFinishedEvent {
    @Required event_type: string; // 'PROFIT_SHARE_FINISHED' ?
    @Required profit_share_gross: number;
    @Required management_fees: number;
    @Required profit_share_net: number;
    @Required technical_rate: number;
    @Required wallet_item: WalletItem;
}

@ExtendRules(ProfitSharingInitEvent)
export class ProfitSharingDB extends ProfitSharingInitEvent {
    @Required PK: string;
    @Required SK: string;
    @Simple created_date?: number;
    @Simple updated_date?: number;
}

@ExtendRules(ProfitSharingInitEvent)
export class ContextProfitSharing extends ProfitSharingInitEvent {
    @Required workflow_type: WorkflowType;
    @Required query: string; // 1 the query to execute
    @Simple athenaResult?: AthenaResult; // 2 where the stepfunction will put the result
    @Simple payload?: WalletOperations[]; // 3 the response of the query athena
    @Simple wallet_items?: WalletItem[]; // 4 the new items created after the calcul of the pb ( to sent to wallet and create new wallet items in db )
}
