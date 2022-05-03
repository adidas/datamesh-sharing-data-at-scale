import { Construct, Duration } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { Function as LambdaFunction, Code, Runtime } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { DeploymentEnvironment, DEV_DEPLOYMENT_ENVIRONMENT, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';
import defaultConfig from './config/lambdas.config.default.json';
import devConfig from './config/lambdas.config.dev.json';
import prodConfig from './config/lambdas.config.prod.json';

export type GetDataProductS3FilesProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
  readonly dataProductCatalogueBucket: Bucket;
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

export class GetDataProductS3Files extends Construct {
  /* AWS resources attached to this construct */
  public readonly lambda: LambdaFunction;

  public constructor(scope: Construct, id: string, props: GetDataProductS3FilesProps) {
    super(scope, id);

    this.lambda = this.setupLambda(this, props);
  }

  private setupLambda(scope: Construct, {
    deploymentEnvironment, stackBaseName, dataProductCatalogueBucket
  }: GetDataProductS3FilesProps): LambdaFunction {
    const {
      Logging: configLogging, Lambda: configLambda
    } = this.loadConfig(deploymentEnvironment);

    const lambdaFunctionId = 'GetDataProductS3Files';
    const lambda = new LambdaFunction(scope, lambdaFunctionId, {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('./common-aws/get-data-product-s3-files-lambda/dist'),
      handler: 'index.getDataProductS3FilesHandler',
      description: 'Reads all data products assets files from s3 and returns their values',
      timeout: Duration.seconds(configLambda.TimeoutSeconds),
      environment: {
        LOGGER_LEVEL: configLogging.LogLevel,
        BUCKET_NAME: dataProductCatalogueBucket.bucketName
      },
      functionName: `${ stackBaseName }-${ lambdaFunctionId }-${ deploymentEnvironment }`
        .substring(0, configLambda.MaxNameLength),
      memorySize: configLambda.MemorySizeMB,
      logRetention: configLogging.RetentionInDays
    });

    lambda.addToRolePolicy(
      new PolicyStatement({
        actions: [ 's3:ListBucket', 's3:GetObject' ],
        resources: [
          `arn:aws:s3:::${ dataProductCatalogueBucket.bucketName }`,
          `arn:aws:s3:::${ dataProductCatalogueBucket.bucketName }/*`
        ]
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
