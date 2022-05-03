import { Construct, Duration, Stack } from '@aws-cdk/core';
import { Function as LambdaFunction, Code, Runtime } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { DeploymentEnvironment, DEV_DEPLOYMENT_ENVIRONMENT, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';
import defaultConfig from './config/lambdas.config.default.json';
import devConfig from './config/lambdas.config.dev.json';
import prodConfig from './config/lambdas.config.prod.json';

export type UpdateGlueCatalogPolicyLambdaProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
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

export class UpdateGlueCatalogPolicyLambda extends Construct {
  /* AWS resources attached to this construct */
  public readonly lambda: LambdaFunction;

  public constructor(scope: Construct, id: string, props: UpdateGlueCatalogPolicyLambdaProps) {
    super(scope, id);

    this.lambda = this.setupLambda(this, props);
  }

  private setupLambda(scope: Construct, {
    deploymentEnvironment, stackBaseName
  }: UpdateGlueCatalogPolicyLambdaProps): LambdaFunction {
    const {
      Logging: configLogging, Lambda: configLambda
    } = this.loadConfig(deploymentEnvironment);

    const { account, region } = Stack.of(this);

    const lambdaFunctionId = 'UpdateGlueCatalogPolicyLambda';
    const lambda = new LambdaFunction(scope, lambdaFunctionId, {
      reservedConcurrentExecutions: 1,
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('./common-aws/update-glue-catalog-policy-lambda/dist'),
      handler: 'index.updateGlueCatalogPolicyHandler',
      description: 'Updates glue catalog policy settings for sharing it with a new account',
      timeout: Duration.seconds(configLambda.TimeoutSeconds),
      environment: {
        LOGGER_LEVEL: configLogging.LogLevel,
        ACCOUNT_ID: account,
        REGION: region
      },
      functionName: `${ stackBaseName }-${ lambdaFunctionId }-${ deploymentEnvironment }`
        .substring(0, configLambda.MaxNameLength),
      memorySize: configLambda.MemorySizeMB,
      logRetention: configLogging.RetentionInDays
    });

    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: [ 'glue:GetResourcePolicy', 'glue:PutResourcePolicy' ],
        resources: [ '*' ]
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
