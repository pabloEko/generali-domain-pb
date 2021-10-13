import {
    Action,
    ACTION_HANDLERS,
    ActionFailure,
    Configuration,
    ConfigurationConsumerProcessHandler,
    ConfigurationDeployStepResponseHandler,
    ConfigurationHandler,
    ConfigurationProviderProcessHandler,
    ConfigurationService,
    DYNAMO_CONFIGURATION,
    ManagementHandler,
    PROCESS_HANDLERS,
    SERVICE_NAME,
    SQS_RPC_QUEUE
} from '@ekonoo/ekonoo-management-lib';
import { Service } from '@ekonoo/lambdi';
import { Required } from '@ekonoo/models';

import { Dummy } from '../models/dummy.model';
import { DummyService } from '../services/dummy.service';

/**
 * begin dummy configuration consuming
 */

class DummyConfiguration {
    @Required dummy: Dummy;
}

@Service({
    providers: [DummyService]
})
export class DummyConfigurationHandler extends ConfigurationHandler<DummyConfiguration> {
    configurationStruct = DummyConfiguration;

    constructor(private readonly dummyService: DummyService) {
        super();
    }

    async check(conf: Configuration<DummyConfiguration>): Promise<void> {
        // do some check for this data
        // if the test fail, you must throw a ActionFailure
        if (!(await this.dummyService.check(conf.data.dummy))) {
            // code
        }
    }

    async save(conf: Configuration<DummyConfiguration>): Promise<void> {
        return this.dummyService.save(conf.data.dummy);
    }
}

/** end of config consumption */

/** begin of custom action */

export class DummyActionParams {
    @Required foo: number;
}

interface DummyActionResult {
    bar: number;
}

@Service({ providers: [DummyService] })
export class DummyAction extends Action<DummyActionParams, DummyActionResult> {
    parameterType = DummyActionParams;

    constructor(private readonly service: DummyService) {
        super();
    }

    async run(params: DummyActionParams): Promise<DummyActionResult> {
        // do something with params and this.service
        return Promise.resolve({ bar: 42 });
    }
}
/** end of custom actions */

export const MANAGEMENT_PROVIDERS = [
    // common stuff
    ManagementHandler,
    { provide: SERVICE_NAME, useValue: process.env.SERVICE_NAME }, // mandatory
    { provide: DYNAMO_CONFIGURATION, useValue: { tableName: process.env.TABLE_NAME as string } }, // required for configuration providers and rpc call with response handling
    { provide: SQS_RPC_QUEUE, useValue: process.env.SQS_RPC_QUEUE }, // required for rpc call with response handling
    { provide: ACTION_HANDLERS, useValue: { dummy: DummyAction } }, // facultative, to handle Rpc from other domain

    {
        provide: PROCESS_HANDLERS,
        useValue: [
            // ####  in most case, you will only need one of them ConfigurationConsumerProcessHandler/ConfigurationProviderProcessHandler
            // => https://github.com/ekonoo/ekonoo-management-lib/blob/master/docs/ProcessHandlers.md
            // configuration consumption: we consume the DUMMY with the check and save from DummyConfigurationHandler
            new ConfigurationConsumerProcessHandler({
                DUMMY: DummyConfigurationHandler
            }),
            // configuration provider, we provide some configuration, but they are dynamicly managed via the configuration service
            new ConfigurationProviderProcessHandler()
        ]
    },
    // used by configuration providers
    ConfigurationService,
    ConfigurationDeployStepResponseHandler,
    // used by configuration consumer
    DummyConfigurationHandler
];
