import { Construct, Duration } from '@aws-cdk/core';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { Function as LambdaFunction, Code, Runtime } from '@aws-cdk/aws-lambda';
import { Bucket } from '@aws-cdk/aws-s3';
import { EventBus } from '@aws-cdk/aws-events';
import { DeploymentEnvironment, DEV_DEPLOYMENT_ENVIRONMENT, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';
import defaultConfig from './config/lambdas.config.default.json';
import devConfig from './config/lambdas.config.dev.json';
import prodConfig from './config/lambdas.config.prod.json';

export type DataProductAssetsCRLambdaProps = {
  readonly stackBaseName: string;
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly dataProductCatalogueBucket: Bucket;
  readonly dataProductCatalogueEventBus: EventBus;
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

export class DataProductAssetsCRLambda extends Construct {
  public readonly customResourceLambda: LambdaFunction;

  public constructor(scope: Construct, id: string, props: DataProductAssetsCRLambdaProps) {
    super(scope, id);

    const { deploymentEnvironment, dataProductCatalogueBucket, dataProductCatalogueEventBus, stackBaseName } = props;
    const { Logging: configLogging, Lambda: configLambda } = this.loadConfig(deploymentEnvironment);
    const lambdaId = 'DataProductAssetCustomResource';

    this.customResourceLambda = new LambdaFunction(this, lambdaId, {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('./data-product-assets-setup/data-product-asset-lambda/dist'),
      handler: 'index.dataProductAssetHandler',
      description: 'Create a data product asset on a s3 bucket',
      timeout: Duration.seconds(configLambda.TimeoutSeconds),
      environment: {
        LOGGER_LEVEL: configLogging.LogLevel,
        BUCKET_NAME: dataProductCatalogueBucket.bucketName,
        EVENT_BUS: dataProductCatalogueEventBus.eventBusArn
      },
      functionName: `${ stackBaseName }-${ lambdaId }-${ deploymentEnvironment }`
        .substring(0, configLambda.MaxNameLength),
      memorySize: configLambda.MemorySizeMB,
      logRetention: configLogging.RetentionInDays
    });

    this.customResourceLambda.addToRolePolicy(
      new PolicyStatement({
        actions: [ 's3:*' ],
        resources: [
          dataProductCatalogueBucket.bucketArn,
          `${ dataProductCatalogueBucket.bucketArn }/*`
        ]
      })
    );

    this.customResourceLambda.addToRolePolicy(
      new PolicyStatement({
        actions: [ 'events:PutEvents' ],
        resources: [ dataProductCatalogueEventBus.eventBusArn ]
      })
    );
  }

  private loadConfig(deploymentEnvironment: DeploymentEnvironment): LambdaConfig {
    switch (deploymentEnvironment) {
    case PROD_DEPLOYMENT_ENVIRONMENT: return { ...defaultConfig, ...prodConfig };
    case DEV_DEPLOYMENT_ENVIRONMENT: return { ...defaultConfig, ...devConfig };
    default: return defaultConfig;
    }
  }
}
