import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { DataProductCatalogueS3 } from './catalogue-assets-main-stack/s3';
import { DataProductAssetsCRLambda } from './catalogue-assets-main-stack/lambda';
import { DataProductCatalogueEvent } from './catalogue-assets-main-stack/event-rule';

export type StackBaseProps = StackProps & {
  readonly stackBaseName: string;
  readonly deploymentEnvironment: DeploymentEnvironment;
};

export class CatalogueAssetsMainStack extends Stack {
  public readonly dataProductCatalogueS3: DataProductCatalogueS3;
  public readonly dataProductCatalogueEvent: DataProductCatalogueEvent;
  public readonly dataProductAssetsCRLambda: DataProductAssetsCRLambda;

  public constructor(scope: Construct, id: string, stackProps: StackBaseProps) {
    super(scope, id, stackProps);

    const { deploymentEnvironment, stackBaseName } = stackProps;

    this.dataProductCatalogueS3 = new DataProductCatalogueS3(this, 'DataProductCatalogueS3', {
      deploymentEnvironment
    });

    this.dataProductCatalogueEvent = new DataProductCatalogueEvent(this, 'DataProductCatalogueEvent', {
      deploymentEnvironment
    });

    this.dataProductAssetsCRLambda = new DataProductAssetsCRLambda(this, 'DataProductAssetsCRLambda', {
      deploymentEnvironment,
      stackBaseName,
      dataProductCatalogueBucket: this.dataProductCatalogueS3.dataProductCatalogueBucket,
      dataProductCatalogueEventBus: this.dataProductCatalogueEvent.eventBus
    });
  }
}
