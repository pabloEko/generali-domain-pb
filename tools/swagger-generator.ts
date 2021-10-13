import { Molder } from '@ekonoo/models';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { yamlParse } from 'yaml-cfn';

const pkg = require('../package.json');

interface LambdaApiProperties {
    Path: string;
    Method: string;
    CodeUri: string;
    Handler: string;
}

interface PropsAndModels extends LambdaApiProperties {
    lambda: string;
    summary: string;
    description: string;
    query: Record<string, any>;
    multiQuery: Record<string, any>;
    path: Record<string, any>;
    headers: Record<string, any>;
    payload: Record<string, any>;
    responses: Record<string | number, any>;
}

function readSAMTemplate(): any {
    return yamlParse(readFileSync(path.resolve(process.cwd(), './sam/api.yml')).toString());
}

function getLambdaApiProperties(data: { Resources: any[] }): LambdaApiProperties[] {
    return Object.values(data?.Resources || {})
        .filter(resource => resource.Type === 'AWS::Serverless::Function')
        .map(resource =>
            Object.values(resource?.Properties?.Events || {})
                .filter((event: any) => event.Type === 'Api')
                .map((event: any) => ({
                    ...event.Properties,
                    CodeUri: resource?.Properties?.CodeUri,
                    Handler: resource?.Properties?.Handler
                }))
        )
        .reduce((a, c) => a.concat(c), []);
}

function extractModels(lambdas: LambdaApiProperties[]): PropsAndModels[] {
    return lambdas
        .map(lambda => {
            try {
                const loaded = require(path.resolve(
                    process.cwd(),
                    `./src/lambdas/${lambda.CodeUri.split('/').splice(2).join('/')}/${lambda.Handler.split('.')[0]}.ts`
                ));
                const l: any = Object.values(loaded).find(
                    v => v instanceof Function && v.prototype.onHandler instanceof Function
                );
                if (l) {
                    const responses = Reflect.getOwnMetadata('lambdi:responses', l.prototype, 'onHandler') || {};
                    const decorators = Reflect.getOwnMetadata('lambdi:args', l.prototype, 'onHandler');
                    const types = Reflect.getOwnMetadata('design:paramtypes', l.prototype, 'onHandler');
                    const models: Record<string, any> = []
                        .concat(types)
                        .filter(Boolean)
                        .map((type: any, i: number) => {
                            switch ((Object.entries(decorators || []).find(([_, v]) => v === i) || []).shift()) {
                                case 'lambdi:queryparams':
                                    return { query: type };
                                case 'lambdi:multiqueryparams':
                                    return { multiQuery: type };
                                case 'lambdi:pathparams':
                                    return { path: type };
                                case 'lambdi:headers':
                                    return { headers: type };
                                case 'lambdi:payload':
                                    return { payload: type };
                                default:
                                    return undefined;
                            }
                        })
                        .filter(Boolean)
                        .reduce((a, c) => ({ ...a, ...c }), {});
                    return {
                        ...lambda,
                        lambda: l.name,
                        query: models.query && Molder.jsonSchema(models.query),
                        multiQuery: models.multiQuery && Molder.jsonSchema(models.multiQuery),
                        path: models.path && Molder.jsonSchema(models.path),
                        headers: models.headers && Molder.jsonSchema(models.headers),
                        payload: models.payload && Molder.jsonSchema(models.payload),
                        responses
                        // summary: 'Domain API documentation',
                        // description: pkg.description
                    } as PropsAndModels;
                }
            } catch {}
        })
        .filter(Boolean) as PropsAndModels[];
}

function generate(): string {
    const props = extractModels(getLambdaApiProperties(readSAMTemplate()));
    return JSON.stringify({
        openapi: '3.0.1',
        info: {
            title: pkg.name,
            description: pkg.description,
            version: pkg.version
        },
        paths: props.reduce<{ [index: string]: any }>(
            (a, c) => ({
                ...a,
                [c.Path]: {
                    ...a[c.Path],
                    [c.Method]: {
                        summary: c.summary,
                        description: c.description,
                        requestBody: c.payload && {
                            content: {
                                'application/json': {
                                    schema: c.payload
                                    // schema: {
                                    //     $ref: `#/components/schemas/${c.lambda}_payload`
                                    // }
                                }
                            }
                        },
                        responses: {
                            ...Object.entries(c.responses || [])
                                .filter(([code, _]) => code !== '4XX' && code !== '5XX')
                                .map(([code, model]) => ({
                                    [code]: {
                                        content: { 'application/json': { schema: Molder.jsonSchema(model) } },
                                        description: `${c.lambda} ${code} Response`
                                    }
                                }))
                                .reduce((a, c) => ({ ...a, ...c }), {})
                            // default: {
                            //     content: {
                            //         'application/json': {
                            //             schema: { $ref: `#/components/schemas/${c.responses['5XX']?.name}` }
                            //         }
                            //     }
                            // }
                        },

                        parameters: [
                            ...Object.keys(c.query?.properties || {}).map(k => ({
                                in: 'query',
                                name: k,
                                description: c.query?.properties[k]?.description,
                                required: (c.query?.required || []).includes(k),
                                schema: c.query?.properties[k]
                            })),
                            ...Object.keys(c.multiQuery?.properties || {}).map(k => ({
                                in: 'query',
                                name: k,
                                description: c.multiQuery?.properties[k]?.description,
                                required: (c.multiQuery?.required || []).includes(k),
                                schema: c.multiQuery?.properties[k]
                            })),
                            ...Object.keys(c.path?.properties || {}).map(k => ({
                                in: 'path',
                                name: k,
                                description: c.path?.properties[k]?.description,
                                required: true,
                                schema: c.path?.properties[k]
                            })),
                            ...Object.keys(c.headers?.properties || {}).map(k => ({
                                in: 'header',
                                name: k,
                                description: c.headers?.properties[k]?.description,
                                required: (c.headers?.required || []).includes(k),
                                schema: c.headers?.properties[k]
                            }))
                        ],
                        'x-amazon-apigateway-integration': {
                            uri: '',
                            type: 'aws_proxy',
                            httpMethod: 'POST',
                            responses: {
                                default: {
                                    statusCode: 200,
                                    responseParameters: {
                                        'method.response.header.Access-Control-Allow-Methods': "'*'",
                                        'method.response.header.Access-Control-Allow-Headers':
                                            "'Content-Type,X-Amz-Date,Authorization,Accept,Origin,Referer,User-Agent'"
                                    },
                                    responseTemplates: {
                                        'application/json': '{}\n'
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            {}
        ),
        components: {
            schemas: props.reduce(
                (a, c) => ({
                    ...a,
                    ...{
                        [`${c.responses['5XX'].name}`]: Molder.jsonSchema(c.responses['5XX'])
                    }
                }),
                {}
            )
        }
    });
}

function writeSwagger(content: string): void {
    writeFileSync(path.resolve(process.cwd(), './dist/swagger.json'), content);
}

writeSwagger(generate());
