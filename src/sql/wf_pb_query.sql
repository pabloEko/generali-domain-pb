with individuals as (
    select distinct individual_id, deal_id, compartment from curated_wallet_item where fund in /*=replace :euro_fund */ ('EURGENERALI1') /*=endreplace */
), quantity as (
    select individuals.individual_id, individuals.deal_id, individuals.compartment, sum(quantity) as sum_quantity
    from individuals
        left join curated_wallet_item
            on individuals.individual_id = curated_wallet_item.individual_id
            and individuals.deal_id = curated_wallet_item.deal_id
            and individuals.compartment = curated_wallet_item.compartment
    where curated_wallet_item.fund in /*=replace :euro_fund */ ('EURGENERALI1') /*=endreplace */  and curated_wallet_item.created_date < date /*=replace :start_date */ date '2021-11-06'/*=endreplace */
    group by individuals.individual_id, individuals.deal_id, individuals.compartment
), items as (
    select individuals.individual_id,
        individuals.deal_id,
        individuals.compartment,
        array_agg(curated_wallet_item.json order by curated_wallet_item.created_date) as items,
        max(curated_wallet_item.created_date) as created_date
        from individuals
            left join curated_wallet_item
                on individuals.individual_id =  curated_wallet_item.individual_id
                and individuals.deal_id = curated_wallet_item.deal_id
                and individuals.compartment = curated_wallet_item.compartment
        where curated_wallet_item.fund in /*=replace :euro_fund */ ('EURGENERALI1') /*=endreplace */  and curated_wallet_item.created_date >= date /*=replace :start_date */ date '2021-01-01'/*=endreplace */ and curated_wallet_item.created_date <= date /*=replace :end_date */ date '2021-12-31'/*=endreplace */
        group by individuals.individual_id, individuals.deal_id, individuals.compartment
        order by individuals.individual_id, individuals.deal_id, individuals.compartment, max(curated_wallet_item.created_date) ASC
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
		).value.value AS guarantee
	FROM curated_organization_deal
),
is_enabled AS(
    select *, (status = 'ACTIVATED') as is_guarantee_enabled
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
    individuals.individual_id,
    individuals.deal_id,
    individuals.compartment,
    wallet_items.items,
    wallet_items.created_date,
    coalesce((quantity.sum_quantity), 0) as sum_quantity,
    coalesce((guarantee.guarantee), 0) as guarantee,
    is_enabled.is_guarantee_enabled
from individuals
    left join items as wallet_items
                on individuals.individual_id =  wallet_items.individual_id
                and individuals.deal_id = wallet_items.deal_id
                and individuals.compartment = wallet_items.compartment
    left join quantity
                on individuals.individual_id =  quantity.individual_id
                and individuals.deal_id = quantity.deal_id
                and individuals.compartment = quantity.compartment
    left join guarantee
                on individuals.deal_id = guarantee.deal_id
    left join is_enabled
                on individuals.deal_id = is_enabled.deal_id
                and individuals.individual_id = is_enabled.individual_id


