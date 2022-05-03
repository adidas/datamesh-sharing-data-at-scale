import { Construct, StackProps, Fn, RemovalPolicy, Stack } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { DeploymentEnvironment, DEV_DEPLOYMENT_ENVIRONMENT, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';

export type DataProductCatalogueS3Props = StackProps & {
  readonly deploymentEnvironment: DeploymentEnvironment;
};

export class DataProductCatalogueS3 extends Construct {
  public readonly stackHashIdSuffix: string;
  public readonly dataProductCatalogueBucket: Bucket;

  public constructor(scope: Construct, id: string, props: DataProductCatalogueS3Props) {
    super(scope, id);

    const { deploymentEnvironment } = props;

    const { stackId } = Stack.of(this);

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    this.stackHashIdSuffix = Fn.select(0, Fn.split('-', Fn.select(2, Fn.split('/', stackId))));

    const deploymentEnvironmentSuffix = this.shouldRetain(deploymentEnvironment) ? ''
      : `-${ deploymentEnvironment }`.toLowerCase();

    this.dataProductCatalogueBucket = new Bucket(this, 'DataProductCatalogueBucket', {
      bucketName: `adidas-data-product-catalogue${ deploymentEnvironmentSuffix }-${ this.stackHashIdSuffix }`,
      removalPolicy: this.shouldRetain(deploymentEnvironment) ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      versioned: this.shouldRetain(deploymentEnvironment)
    });
  }

  private shouldRetain(deploymentEnvironment: DeploymentEnvironment): boolean {
    return deploymentEnvironment === PROD_DEPLOYMENT_ENVIRONMENT
      || deploymentEnvironment === DEV_DEPLOYMENT_ENVIRONMENT;
  }
}
