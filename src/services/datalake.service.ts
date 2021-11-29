import { AthenaResult, DatalakeService } from '@ekonoo/backend-common';
import { Logger, Service } from '@ekonoo/lambdi';

@Service({
    providers: []
})
export class DatalakeSvc {
    MAX_RESULTS = 100;
    constructor(private readonly logger: Logger, private readonly datalakeService: DatalakeService) {}

    async getQueryResults<T>(
        { QueryExecutionId, NextToken }: AthenaResult,
        model: (new () => T) | null
    ): Promise<{ data: T[]; nextToken: string | undefined } | undefined> {
        this.logger.info({
            msg: 'Querying data from datalake',
            QueryExecutionId,
            NextToken
        });
        return this.datalakeService.getQueryResults(
            { QueryExecutionId, NextToken: NextToken || undefined },
            model,
            this.MAX_RESULTS
        );
    }
}
