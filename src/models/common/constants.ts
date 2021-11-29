export type FeeType = 'SUBSCRIPTION' | 'PURCHASE' | 'FIXED' | 'EURO';

export type ContractType = 'TNS' | 'TS' | 'NOT_APPLICABLE';

export type PurposeType =
    | 'RETIRED'
    | 'PRINCIPAL_RESIDENCE_PURCHASE'
    | 'HOUSE_CONSTRUCTION'
    | 'RESIDENCE_WORK'
    | 'RESIDENCE_EXPANSION'
    | 'CIVIL_MARRIAGE' // MARIAGE, PACS
    | 'DIVORCED' // PACS with 1 child
    | 'BIRTH' // BIRTH or ADOPTION
    | 'DEADLINE'
    | 'DOMESTIC_VIOLENCE'
    | 'BUSINESS_CREATION'
    | 'INSURANCE_RIGHT_EXPIRY' // UNEMPLOYMENT
    | 'JUDICIAL_LIQUIDATION'
    | 'DEATH'
    | 'DISABILITY'
    | 'OVER_INDEBTEDNESS'
    | 'CESSATION_OF_ACTIVITY';

export type ProductType = 'PEE' | 'PER';

export type CompartmentType = 'D_INDIVIDUAL' | 'INDIVIDUAL' | 'COLLECTIVE' | 'MANDATORY' | 'NOT_APPLICABLE';

export type ContractStatus = 'RETIRED' | 'IN' | 'OUT';

export type CashSourceType =
    | 'VOLUNTARY_PAYMENT'
    | 'DEDUCTIBLE_VOLUNTARY_PAYMENT'
    | 'MATCHING_CONTRIBUTION'
    | 'MANDATORY_CONTRIBUTION'
    | 'PARTICIPATION'
    | 'PROFIT_SHARING'
    | 'TIME_SAVING'
    | 'PAYOUT'
    | 'SEED_MATCHING';
