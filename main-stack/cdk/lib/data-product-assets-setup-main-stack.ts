import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { DataProductAssetsSetup } from '@adidas-data-mesh/data-product-assets-setup-cdk';

export type StackBaseProps = StackProps & {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
  readonly dataProductCataloguePath: string;
  readonly dataProductNameObjectKey: string;
  readonly customResourceLambda: LambdaFunction;
};

export class DataProductAssetsMainStack extends Stack {
  public readonly DataProductAssetsSetup: DataProductAssetsSetup;

  public constructor(scope: Construct, id: string, stackProps: StackBaseProps) {
    super(scope, id, stackProps);

    const {
      deploymentEnvironment, stackBaseName, dataProductCataloguePath, dataProductNameObjectKey, customResourceLambda
    } = stackProps;

    this.DataProductAssetsSetup = new DataProductAssetsSetup(this, 'DataProductAssetsSetup', {
      deploymentEnvironment,
      stackBaseName,
      dataProductCataloguePath,
      dataProductNameObjectKey,
      customResourceLambda
    });
  }
}
