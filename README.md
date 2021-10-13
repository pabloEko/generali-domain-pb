# NAME Domain

## Alerting implementation

Alerting is implemented via the `alerting-<env>.yml` templates. Additional documentation is available [here](https://github.com/ekonoo/ekonoo-doc/wiki/AWS-Resources-alerting-templates).

## Architecture

![Archictecture](/docs/architecture.png)

## Events

[Details here](./docs/events.md)

### consumption

- lu.ekonoo.some-domain.some-model.some-action

### provide

- my-model.my-operation.my-action

## Seeding

this domain need

### Configuration

this dommain consume:

Management:Configuration:DUMMY: check that the DUMMY hase som data


### SSM

no ssm parameters

## DEV

### linting

cloudformation’s sam check:

`docker run --rm -v $(pwd)/sam:/data cfn-python-lint:latest "/data/*.yml"`

eslint check

`npm run lint`

### Tests

#### unit testing:

`make test`

#### e2e testing:

you should run your tests isolated from the other domains.

0. setup env var ISOLATED=true to isolate your domain:

`export isolated=true`

this way, we will create a dedicated eventbus for our stack.

1. deploy (with the AWS_PROFILE allowed to deploy, ie: cloudformation user)

`npm run build && make package deploy`

2. run the tests (with the AWS_PROFILE allowed to run the tests. see ekonoo-testing stack)

`make test-e2e`

or manually

`./node_modules/.bin/run-scenario --bus-name=${MyDomainName}-dev-isolated --stack-suffix=dev-isolated test/scenario/...`

## Publish to AWS

`make build`

-   Webpack

Run webpack in prod mode. Only bundle the code source in `/dist`. No NPM deps.
The lambdas will need a layer with the NPM deps to be able to run.

-   Layer

Will install NPM production's deps in `dist/layer`

`make package`

Sam package command (need to fix the s3 bucket)

`make deploy`

Sam deploy command

`make all`
