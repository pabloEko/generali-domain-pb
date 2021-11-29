import {
    ContextProfitSharing,
    ProfitSharingInitEvent,
    WorkflowType
} from '../../src/models/events/profit-sharing.model';

const event: ProfitSharingInitEvent = {
    event_type: 'PROFIT_SHARE_STARTED',
    profit_share_gross: 3,
    management_fees: 1,
    provider: 'GENERALLI',
    technical_rate: 1,
    year: 2020,
    profit_share_net: 1.5,
    isins: ['EURGENERALI1'],
    rate_reasons: {
        authorize: 1,
        decease: 1
    }
};
export const context_annual_pb: ContextProfitSharing = {
    ...event,
    workflow_type: WorkflowType.ANNUAL_PROFIT_SHARING,
    query: '',
    payload: [
        {
            individual_id: '201446dcf52ae8b1480f',
            deal_id: 'deal_1005',
            compartment: 'INDIVIDUAL',
            sum_quantity: 0,
            guarantee: 0,
            is_guarantee_enabled: false,
            // items: []
            items: [
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211108Z0zwe69A-I00',
                    operation_type: 'SUBSCRIPTION',
                    compartment: 'D_INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: 4898.0,
                    price: 1.0,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 562.39,
                    purchase_provision: 0.0,
                    purchase_used: 1856.146733,
                    executed_order_date: 1636383738285,
                    created_date: 1595980800000, // 1595973600000, // '2020-07-29'
                    updated_date: 1595980800000
                    // year: '2021',
                    // month: '11',
                    // day: '08'
                },
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211109iib4kyyk-I00',
                    operation_type: 'PURCHASE',
                    compartment: 'INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: -131.85,
                    price: 2.29, // ???
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 0.0,
                    purchase_provision: 0.0,
                    purchase_used: 0.0,
                    executed_order_date: 1636473742444,
                    created_date: 1598659200000, // 1598652000000, // '2020-08-29'
                    updated_date: 1598659200000
                    // year: '2021',
                    // month: '11',
                    // day: '09'
                },
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211108N78I8VDz-I00',
                    operation_type: 'SUBSCRIPTION',
                    compartment: 'INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: 34684,
                    price: 1.0,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 3982.7,
                    purchase_provision: 0.0,
                    purchase_used: 13143.853267,
                    executed_order_date: 1636383745197,
                    created_date: 1603929600000, // 1603926000000, // '2020-10-29'
                    updated_date: 1603929600000
                    // year: '2021',
                    // month: '11',
                    // day: '08'
                },
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211109iib4kyyk-I00',
                    operation_type: 'PURCHASE',
                    compartment: 'D_INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: -1856.14,
                    price: 2.29,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 0.0,
                    purchase_provision: 0.0,
                    purchase_used: 0.0,
                    executed_order_date: 1636473742285,
                    created_date: 1606608000000, // 1606604400000, // '2020-11-29'
                    updated_date: 1606608000000
                    // year: '2021',
                    // month: '11',
                    // day: '09'
                }
            ]
        },
        {
            individual_id: '201446dcf52ae8b1480f',
            deal_id: 'deal_1005',
            compartment: 'INDIVIDUAL',
            sum_quantity: 0,
            guarantee: 0,
            is_guarantee_enabled: false
        },
        {
            individual_id: '201446dcf52ae8b1480f',
            deal_id: 'deal_1005',
            compartment: 'INDIVIDUAL',
            sum_quantity: 100,
            guarantee: 0,
            is_guarantee_enabled: false
        },
        {
            individual_id: '201446dcf52ae8b1480f',
            deal_id: 'deal_1005',
            compartment: 'INDIVIDUAL',
            sum_quantity: 101,
            guarantee: 0,
            is_guarantee_enabled: false,
            // items: []
            items: [
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211108Z0zwe69A-I00',
                    operation_type: 'SUBSCRIPTION',
                    compartment: 'D_INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: 4898.0,
                    price: 1.0,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 562.39,
                    purchase_provision: 0.0,
                    purchase_used: 1856.146733,
                    executed_order_date: 1636383738285,
                    created_date: 1595980800000, // 1595973600000, // '2020-07-29'
                    updated_date: 1595980800000
                    // year: '2021',
                    // month: '11',
                    // day: '08'
                },
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211109iib4kyyk-I00',
                    operation_type: 'PURCHASE',
                    compartment: 'INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: -131.85,
                    price: 2.29, // ???
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 0.0,
                    purchase_provision: 0.0,
                    purchase_used: 0.0,
                    executed_order_date: 1636473742444,
                    created_date: 1598659200000, // 1598652000000, // '2020-08-29'
                    updated_date: 1598659200000
                    // year: '2021',
                    // month: '11',
                    // day: '09'
                },
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211108N78I8VDz-I00',
                    operation_type: 'SUBSCRIPTION',
                    compartment: 'INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: 34684,
                    price: 1.0,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 3982.7,
                    purchase_provision: 0.0,
                    purchase_used: 13143.853267,
                    executed_order_date: 1636383745197,
                    created_date: 1603929600000, // 1603926000000, // '2020-10-29'
                    updated_date: 1603929600000
                    // year: '2021',
                    // month: '11',
                    // day: '08'
                },
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211109iib4kyyk-I00',
                    operation_type: 'PURCHASE',
                    compartment: 'D_INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: -1856.14,
                    price: 2.29,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 0.0,
                    purchase_provision: 0.0,
                    purchase_used: 0.0,
                    executed_order_date: 1636473742285,
                    created_date: 1606608000000, // 1606604400000, // '2020-11-29'
                    updated_date: 1606608000000
                    // year: '2021',
                    // month: '11',
                    // day: '09'
                }
            ]
        }
    ]
};

export const context_total_purchase_pb: ContextProfitSharing = {
    ...event,
    workflow_type: WorkflowType.TOTAL_PURCHASE,
    query: '',
    payload: [
        {
            individual_id: '201446dcf52ae8b1480f',
            deal_id: 'deal_1005',
            compartment: 'INDIVIDUAL',
            sum_quantity: 0,
            guarantee: 0,
            is_guarantee_enabled: false,
            // items: []
            items: [
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211108Z0zwe69A-I00',
                    operation_type: 'SUBSCRIPTION',
                    compartment: 'D_INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: 4898.0,
                    price: 1.0,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 562.39,
                    purchase_provision: 0.0,
                    purchase_used: 1856.146733,
                    executed_order_date: 1636383738285,
                    created_date: 1595980800000, // 1595973600000, // '2020-07-29'
                    updated_date: 1595980800000
                    // year: '2021',
                    // month: '11',
                    // day: '08'
                },
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211109iib4kyyk-I00',
                    operation_type: 'PURCHASE',
                    compartment: 'INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: -131.85,
                    price: 2.29, // ???
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 0.0,
                    purchase_provision: 0.0,
                    purchase_used: 0.0,
                    executed_order_date: 1636473742444,
                    created_date: 1598659200000, // 1598652000000, // '2020-08-29'
                    updated_date: 1598659200000
                    // year: '2021',
                    // month: '11',
                    // day: '09'
                },
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211108N78I8VDz-I00',
                    operation_type: 'SUBSCRIPTION',
                    compartment: 'INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: 34684,
                    price: 1.0,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 3982.7,
                    purchase_provision: 0.0,
                    purchase_used: 13143.853267,
                    executed_order_date: 1636383745197,
                    created_date: 1603929600000, // 1603926000000, // '2020-10-29'
                    updated_date: 1603929600000
                    // year: '2021',
                    // month: '11',
                    // day: '08'
                },
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211109iib4kyyk-I00',
                    operation_type: 'PURCHASE',
                    compartment: 'D_INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: -39450.15,
                    price: 2.29,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 0.0,
                    purchase_provision: 0.0,
                    purchase_used: 0.0,
                    executed_order_date: 1636473742285,
                    created_date: 1606608000000, // 1606604400000, // '2020-11-29'
                    updated_date: 1606608000000,
                    purchase_purpose: 'PRINCIPAL_RESIDENCE_PURCHASE'
                    // year: '2021',
                    // month: '11',
                    // day: '09'
                }
            ]
        },
        {
            individual_id: '201446dcf52ae8b1480f',
            deal_id: 'deal_1005',
            compartment: 'INDIVIDUAL',
            sum_quantity: 100,
            guarantee: 0,
            is_guarantee_enabled: false,
            // items: []
            items: [
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211108Z0zwe69A-I00',
                    operation_type: 'SUBSCRIPTION',
                    compartment: 'D_INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: 4898.0,
                    price: 1.0,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 562.39,
                    purchase_provision: 0.0,
                    purchase_used: 1856.146733,
                    executed_order_date: 1636383738285,
                    created_date: 1595980800000, // 1595973600000, // '2020-07-29'
                    updated_date: 1595980800000
                    // year: '2021',
                    // month: '11',
                    // day: '08'
                },
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211109iib4kyyk-I00',
                    operation_type: 'PURCHASE',
                    compartment: 'INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: -231.85,
                    price: 2.29, // ???
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 0.0,
                    purchase_provision: 0.0,
                    purchase_used: 0.0,
                    executed_order_date: 1636473742444,
                    created_date: 1598659200000, // 1598652000000, // '2020-08-29'
                    updated_date: 1598659200000
                    // year: '2021',
                    // month: '11',
                    // day: '09'
                },
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211108N78I8VDz-I00',
                    operation_type: 'SUBSCRIPTION',
                    compartment: 'INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: 34684,
                    price: 1.0,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 3982.7,
                    purchase_provision: 0.0,
                    purchase_used: 13143.853267,
                    executed_order_date: 1636383745197,
                    created_date: 1603929600000, // 1603926000000, // '2020-10-29'
                    updated_date: 1603929600000
                    // year: '2021',
                    // month: '11',
                    // day: '08'
                },
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211109iib4kyyk-I00',
                    operation_type: 'PURCHASE',
                    compartment: 'D_INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: -39450.15,
                    price: 2.29,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 0.0,
                    purchase_provision: 0.0,
                    purchase_used: 0.0,
                    executed_order_date: 1636473742285,
                    created_date: 1606608000000, // 1606604400000, // '2020-11-29'
                    updated_date: 1606608000000,
                    purchase_purpose: 'PRINCIPAL_RESIDENCE_PURCHASE'
                    // year: '2021',
                    // month: '11',
                    // day: '09'
                }
            ]
        },
        {
            individual_id: '201446dcf52ae8b1480f',
            deal_id: 'deal_1005',
            compartment: 'INDIVIDUAL',
            sum_quantity: 101,
            guarantee: 0,
            is_guarantee_enabled: false,
            // items: []
            items: [
                {
                    individual_id: '201446dcf52ae8b1480f',
                    deal_id: 'deal_1005',
                    instruction_id: 'O211108Z0zwe69A-I00',
                    operation_type: 'SUBSCRIPTION',
                    compartment: 'D_INDIVIDUAL',
                    product: 'PER',
                    fund: 'EURGENERALI1',
                    quantity: -101,
                    price: 1.0,
                    currency: 'EUR',
                    pru_financial: 1.0,
                    pru_tax: 1.0,
                    // fees: 562.39,
                    purchase_provision: 0.0,
                    purchase_used: 1856.146733,
                    executed_order_date: 1636383738285,
                    created_date: 1595980800000, // 1595973600000, // '2020-07-29'
                    updated_date: 1595980800000,
                    purchase_purpose: 'PRINCIPAL_RESIDENCE_PURCHASE'
                    // year: '2021',
                    // month: '11',
                    // day: '08'
                }
            ]
        }
    ]
};
