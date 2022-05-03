import { Construct } from '@aws-cdk/core';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda';
import { DataProductAssetCustomResource } from './data-product-asset-custom-resource/custom-resource';

export type DataProductAssetsSetupProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
  readonly dataProductCataloguePath: string;
  readonly dataProductNameObjectKey: string;
  readonly customResourceLambda: LambdaFunction;
};

export class DataProductAssetsSetup extends Construct {
  /* AWS resources attached to this construct */
  public readonly dataProductAssetCustomResource: DataProductAssetCustomResource;

  public constructor(scope: Construct, id: string, props: DataProductAssetsSetupProps) {
    super(scope, id);

    const {
      deploymentEnvironment, customResourceLambda, dataProductCataloguePath, dataProductNameObjectKey
    } = props;

    this.dataProductAssetCustomResource = new DataProductAssetCustomResource(
      this, 'DataProductAssetCustomResource', {
        deploymentEnvironment,
        dataProductCataloguePath,
        customResourceLambda,
        dataProductNameObjectKey
      }
    );
  }
}
