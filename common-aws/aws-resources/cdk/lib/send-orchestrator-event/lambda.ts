import { Construct, Duration } from '@aws-cdk/core';
import { Function as LambdaFunction, Code, Runtime } from '@aws-cdk/aws-lambda';
import { EventBus } from '@aws-cdk/aws-events';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import {
  DeploymentEnvironment, DEV_DEPLOYMENT_ENVIRONMENT, PROD_DEPLOYMENT_ENVIRONMENT
} from '@adidas-data-mesh/common';
import defaultConfig from './config/lambdas.config.default.json';
import devConfig from './config/lambdas.config.dev.json';
import prodConfig from './config/lambdas.config.prod.json';

export type SendOrchestratorEventProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
  readonly orchestratorEventBus: EventBus;
};

export type LambdaConfig = {
  Logging: {
    LogLevel: string;
    RetentionInDays: number;
  };
  Lambda: {
    TimeoutSeconds: number;
    MemorySizeMB: number;
    MaxNameLength: number;
  };
};

export class SendOrchestratorEvent extends Construct {
  /* AWS resources attached to this construct */
  public readonly lambda: LambdaFunction;

  public constructor(scope: Construct, id: string, props: SendOrchestratorEventProps) {
    super(scope, id);

    this.lambda = this.setupLambda(this, props);
  }

  private setupLambda(scope: Construct, {
    deploymentEnvironment, stackBaseName, orchestratorEventBus
  }: SendOrchestratorEventProps): LambdaFunction {
    const {
      Logging: configLogging, Lambda: configLambda
    } = this.loadConfig(deploymentEnvironment);

    const lambdaFunctionId = 'SendOrchestratorEvent';
    const lambda = new LambdaFunction(scope, lambdaFunctionId, {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('./common-aws/send-orchestrator-event-lambda/dist'),
      handler: 'index.sendOrchestratorEventHandler',
      description: 'Sends events from the sfn journeys to orchestrate them',
      timeout: Duration.seconds(configLambda.TimeoutSeconds),
      environment: {
        LOGGER_LEVEL: configLogging.LogLevel,
        EVENT_BUS: orchestratorEventBus.eventBusArn
      },
      functionName: `${ stackBaseName }-${ lambdaFunctionId }-${ deploymentEnvironment }`
        .substring(0, configLambda.MaxNameLength),
      memorySize: configLambda.MemorySizeMB,
      logRetention: configLogging.RetentionInDays
    });

    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: [ 'events:PutEvents' ],
        resources: [ orchestratorEventBus.eventBusArn ]
      })
    );

    return lambda;
  }

  private loadConfig(deploymentEnvironment: DeploymentEnvironment): LambdaConfig {
    switch (deploymentEnvironment) {
    case PROD_DEPLOYMENT_ENVIRONMENT: return { ...defaultConfig, ...prodConfig };
    case DEV_DEPLOYMENT_ENVIRONMENT: return { ...defaultConfig, ...devConfig };
    default: return defaultConfig;
    }
  }
}
