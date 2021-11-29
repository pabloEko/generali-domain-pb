import { PersistentEntity } from '@ekonoo/backend-common';
import { ComputedData } from '@ekonoo/computation';
import { Enum, ExtendRules, Item, Max, Min, Record, Required, Simple } from '@ekonoo/models';

import { RateExitReason } from './profit-sharing.model';

export type ReadingDirection = 'FIFO' | 'LIFO';
export type SponsorMode = 'PARTNERSHIP' | 'OWNERSHIP' | 'DELEGATE';

export enum OperationStatus {
    Created = 'CREATED',
    Pending = 'PENDING',
    Validated = 'VALIDATED',
    Executed = 'EXECUTED',
    Error = 'ERROR',
    Cancelled = 'CANCELLED'
}
export enum OperationSubType {
    Individual = 'INDIVIDUAL',
    Collective = 'COLLECTIVE'
}
export enum OperationType {
    Subscription = 'SUBSCRIPTION',
    Purchase = 'PURCHASE',
    Switch = 'SWITCH'
}
export enum OperationInstructionType {
    Subscription = 'SUBSCRIPTION',
    Purchase = 'PURCHASE',
    Payout = 'PAYOUT'
}

export class SwitchSlice {
    @Required reference: string;
    @Required @Min(-1) @Max(1) value: number;
}
export class SwitchCompartment {
    @Required product: string;
    @Required name: string;
    @Required @Item(SwitchSlice) base: SwitchSlice[];
    @Required @Item(SwitchSlice) real: SwitchSlice[];
    @Required @Item(SwitchSlice) slice: SwitchSlice[];
}

export class Switch {
    @Required @Item(SwitchCompartment) compartments: SwitchCompartment[];
}

export class Sponsor {
    @Required id: string;
    @Required mode: SponsorMode;
}

export class Origin {
    @Required type: string;
    @Required simulation_id: string;
    @Required individual_id: string;
    @Required deal_id: string;
    @Simple global_simulation_id?: string;
    @Simple organization_id?: string;
}

@ExtendRules(PersistentEntity)
export class Operation extends PersistentEntity {
    @Required @Enum(...Object.values(OperationType)) type: OperationType;
    @Simple @Enum(...Object.values(OperationSubType)) sub_type: OperationSubType;
    @Required @Enum(...Object.values(OperationStatus)) status: OperationStatus;
    @Required origin: Origin;
    @Required execution_date: number;
    @Required sponsor: Sponsor;
    @Simple switch: Switch;
    @Simple matching_contribution?: boolean;
}

export class Purchase {
    @Simple year_number?: number;
    @Required direction: ReadingDirection;
}

export class OperationInstruction extends PersistentEntity {
    @Required id: string;
    @Required status: string;
    @Required operation_id: string;
    @Required operation_type: OperationType;
    @Required type: OperationInstructionType;
    @Required origin: Origin;
    @Simple @Record(Purchase) purchase: Record<string, Purchase>;
    @Simple cash_source?: string;
    @Required @Item(ComputedData) data: ComputedData[];

    @Simple is_total_purchase?: boolean;
    @Simple purchase_purpose?: keyof RateExitReason;
}

/**
 * Event data sent to publish an operation state.
 */
export class OperationInstructionStateEvent {
    @Required event_type: 'OPERATION_INSTRUCTION_STATE';
    @Required operation_id: string;
    @Required instruction: OperationInstruction;
}
export class OperationInstructionAppliedEvent {
    @Required event_type: 'OPERATION_INSTRUCTION_APPLIED';
    @Required individual_id: string;
    @Required instruction_id: string;
}

/**
 * Event data sent to publish an operation state.
 */
export class OperationStateEvent {
    @Required event_type: 'OPERATION_STATE';
    @Required operation: Operation;
    @Required instructions: OperationInstruction[];
}

@ExtendRules(OperationStateEvent)
export class OperationStateEventDB extends OperationStateEvent {
    @Required PK: string;
    @Required SK: string;
    @Required status: string;
}
