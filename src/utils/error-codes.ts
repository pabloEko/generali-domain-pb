export class ErrorCode {
    http: number;
    message: string;

    static PB01 = {
        http: 400,
        message: 'Error'
    };

    static PB99 = {
        http: 500,
        message: 'Internal Server Error'
    };
}

export interface BusinessErrorResponse {
    code: string;
    message: string;
}

export class BusinessError extends Error {
    readonly code: string;
    readonly short_message: string;
    readonly http_code: number;

    constructor(errCode: ErrorCode, logMessage: string, stack?: Error['stack']) {
        super(logMessage);
        this.name = 'BusinessError';
        this.code =
            Object.entries(ErrorCode)
                .filter(([_, v]) => v === errCode)
                .map(([k, _]) => k)
                .pop() || 'ES99';

        this.short_message = this.code ? errCode.message : ErrorCode.PB99.message;
        this.http_code = this.code ? errCode.http : ErrorCode.PB99.http;
        this.stack = stack;
    }
}
