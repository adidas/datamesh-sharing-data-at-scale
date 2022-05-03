import { Construct, Duration, Stack } from '@aws-cdk/core';
import { Function as LambdaFunction, Code, Runtime } from '@aws-cdk/aws-lambda';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { DeploymentEnvironment, DEV_DEPLOYMENT_ENVIRONMENT, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';
import defaultConfig from './config/lambdas.config.default.json';
import devConfig from './config/lambdas.config.dev.json';
import prodConfig from './config/lambdas.config.prod.json';

export type UpdateDataProductInDynamoLambdaProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly dataProductCatalogTable: ITable;
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

export class UpdateDataProductInDynamoLambda extends Construct {
  /* AWS resources attached to this construct */
  public readonly lambda: LambdaFunction;

  public constructor(scope: Construct, id: string, props: UpdateDataProductInDynamoLambdaProps) {
    super(scope, id);

    this.lambda = this.setupLambda(this, props);
  }

  private setupLambda(scope: Construct, {
    deploymentEnvironment, stackBaseName, dataProductCatalogTable
  }: UpdateDataProductInDynamoLambdaProps): LambdaFunction {
    const {
      Logging: configLogging, Lambda: configLambda
    } = this.loadConfig(deploymentEnvironment);

    const lambdaFunctionId = 'UpdateDataProductInDynamo';
    const lakeFormationAdminRoleName = deploymentEnvironment === PROD_DEPLOYMENT_ENVIRONMENT
      ? 'data-lake-administrator-prod' : 'data-lake-administrator-dev';
    const accountId = Stack.of(this).account;
    const lambda = new LambdaFunction(scope, lambdaFunctionId, {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('./visibility-journey/update-data-product-in-dynamo-lambda/dist'),
      handler: 'index.updateDataProductInDynamoHandler',
      description: 'Updates a data product from dynamo db table with visibility json object properties',
      timeout: Duration.seconds(configLambda.TimeoutSeconds),
      environment: {
        LOGGER_LEVEL: configLogging.LogLevel,
        DYNAMODB_TABLE_NAME: dataProductCatalogTable.tableName,
        DATA_LAKE_ADMIN_ROLE_SESSION_NAME: lakeFormationAdminRoleName,
        ACCOUNT_ID: accountId
      },
      functionName: `${ stackBaseName }-${ lambdaFunctionId }-${ deploymentEnvironment }`
        .substring(0, configLambda.MaxNameLength),
      memorySize: configLambda.MemorySizeMB,
      logRetention: configLogging.RetentionInDays
    });

    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: [ 'iam:PassRole', 'sts:AssumeRole', 'iam:GetRole' ],
        resources: [ `arn:aws:iam::${ accountId }:role/${ lakeFormationAdminRoleName }` ]
      })
    );

    dataProductCatalogTable.grantWriteData(lambda);

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
