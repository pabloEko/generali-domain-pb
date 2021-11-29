/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ESCAPE_STRING_TOKEN, SqlQueryService } from '@ekonoo/backend-common';
import { Event, generateHandler, Lambda, Logger, SQSRecord } from '@ekonoo/lambdi';
import { StepFunctions } from 'aws-sdk';
import { escape } from 'sqlstring';

import { ProfitSharingInitEvent, WorkflowType } from '../../../models/events/profit-sharing.model';
import { DayjsService } from '../../../services/dayjs';
import { ProfitSharingService } from '../../../services/profit-sharing.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
let query = require('../../../sql/wf_pb_query.sql').default as string;

@Lambda({
    providers: [
        ProfitSharingService,
        DayjsService,
        {
            provide: ESCAPE_STRING_TOKEN,
            useValue: (s: string) => escape(s, true)
        }
    ]
})
// this lambda will receive the info about the pb to store it and start the state machine
export class InitLambda {
    constructor(
        private readonly logger: Logger,
        private readonly pbService: ProfitSharingService,
        private readonly stepFunction: StepFunctions,
        private readonly sqlService: SqlQueryService,
        private readonly dayjsService: DayjsService
    ) {}

    @SQSRecord('detail')
    async onHandler(@Event event: ProfitSharingInitEvent): Promise<boolean> {
        this.logger.info({
            msg:
                'Receive event to start the process of profit sharing. Storing event, building query and starting state machine.',
            event
        });
        this.pbService.checkValidEvent(event);
        query = this.sqlService.replace(query, {
            start_date: this.dayjsService.getInitDate(event.year),
            end_date: this.dayjsService.getEndDate(event.year),
            euro_fund: event.isins
        });
        return this.pbService
            .storePB(event)
            .then(async () => {
                this.logger.info({
                    msg: `Starting state machine for the calculation of the profit sharing`
                });
                return this.stepFunction
                    .startExecution({
                        stateMachineArn: process.env.STATE_MACHINE_ARN || '',
                        input: JSON.stringify(
                            this.pbService.createContext(event, query, WorkflowType.ANNUAL_PROFIT_SHARING)
                        )
                    })
                    .promise();
            })
            .then(_ => true);
    }
}

export const handler = generateHandler(InitLambda);

// get all the users who have invest in euro funds
// per users retrieve all his list of item of euro funds till the end of the last year (if we are in 2021, all till 31.12.2020)
// sum all the Qt before the starting of the year, that would be our init Qt
// then per item apply the formula
// at the end sum all the quantities calculated
// create a new entry in the db wallet
