

with individuals as (
    select distinct individual_id as ind_id, deal_id as d_id from curated_wallet_item where fund in /*=replace :euro_fund */ ('EURGENERALI1') /*=endreplace */
), quantity as (
    select individuals.ind_id, individuals.d_id, sum(quantity) as sum_quantity
    from individuals
        left join curated_wallet_item
            on individuals.ind_id = curated_wallet_item.individual_id
            and individuals.d_id = curated_wallet_item.deal_id
    where curated_wallet_item.fund in /*=replace :euro_fund */ ('EURGENERALI1') /*=endreplace */  and curated_wallet_item.created_date < /*=replace :start_date */ date '2021-10-06'/*=endreplace */
    group by individuals.ind_id, individuals.d_id
), items as (
    select individuals.ind_id,
        individuals.d_id,
        CAST(array_agg(MAP_FROM_ENTRIES(ARRAY[
            ('individual_id', individual_id),
            ('product', product),
            ('deal_id', deal_id),
            ('instruction_id', instruction_id),
            ('operation_type', operation_type),
            ('compartment', compartment),
            ('fund', fund),
            ('quantity', quantity),
            ('currency', currency),
            ('price', price),
            ('pru_financial', pru_financial),
            ('pru_tax', pru_tax),
            ('purchase_provision', purchase_provision),
            ('purchase_used', purchase_used),
            ('executed_order_date', executed_order_date),
            ('created_date', created_date),
            ('updated_date', updated_date),
            ('is_total_purchase', is_total_purchase),
            ('purchase_purpose', purchase_purpose)
        ])) AS JSON) as items
        from individuals
            left join curated_wallet_item
                on individuals.ind_id =  curated_wallet_item.individual_id
                and individuals.d_id = curated_wallet_item.deal_id
        where curated_wallet_item.fund in /*=replace :euro_fund */ ('EURGENERALI1') /*=endreplace */  and curated_wallet_item.created_date >= /*=replace :start_date */ date '2021-01-01'/*=endreplace */ and curated_wallet_item.created_date <= /*=replace :end_date */ date '2021-12-31'/*=endreplace */
        group by individuals.ind_id, individuals.d_id
        order by items.items.created_date ASC
),
guarantee AS (
	SELECT id as deal_id,
		try(
			filter(
				try(
					filter(products.per.guarantees, g->g.type = 'FLOOR') [ 1 ]
				).fees,
				f->f.type = 'EURO'
			) [ 1 ]
		).value AS guarantee
	FROM curated_organization_deal
),
is_guarantee_enabled AS (
    select *, (status = 'ACTIVATED') as is_enabled
    from (
            select dealid as deal_id,
                    guaranteetype,
                    createddate,
                    status,
                    individuid as individual_id,
                    row_number() over (partition by dealid, individuid, guaranteetype order by createddate) as rn
            from curated_individual_guarantee
            where guaranteetype = 'FLOOR' and producttype = 'PER'
        )
    where rn = 1
)
select
    individuals.ind_id,
    individuals.d_id,
    items.items,
    quantity.sum_quantity,
    guarantee.guarantee,
    is_guarantee_enabled.is_enabled
from individuals
    left join items
                on individuals.ind_id =  items.individual_id
                and individuals.d_id = items.deal_id
    left join quantity
                on individuals.ind_id =  quantity.individual_id
                and individuals.d_id = quantity.deal_id
    left join guarantee
                on individuals.d_id = guarantee.deal_id
    left join is_guarantee_enabled
                on individuals.d_id = is_guarantee_enabled.deal_id
                and individuals.ind_id = is_guarantee_enabled.individual_id

/*order by items.items.created_date ASC*/