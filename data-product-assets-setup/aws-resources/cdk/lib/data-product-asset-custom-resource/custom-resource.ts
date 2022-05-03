import { readFileSync } from 'fs';
import { Function as LambdaFunction } from '@aws-cdk/aws-lambda';
import { CfnResource, Construct } from '@aws-cdk/core';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import {
  DataProductConsumersObject, DataProductInputsObject, DataProductObject, DataProductOutputsObject,
  DataProductProducerInfoObject, DataProductVisibilityObject, AssetName
} from './config/data-product-assets.model';

export type DataProductAssetCustomResourceProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly dataProductCataloguePath: string;
  readonly dataProductNameObjectKey: string;
  readonly customResourceLambda: LambdaFunction;
};

export class DataProductAssetCustomResource extends Construct {
  /* AWS resources attached to this this */
  public readonly dataProductCR: CfnResource;
  public readonly dataProductVisibilityCR: CfnResource;
  public readonly dataProductConsumersCR: CfnResource;

  public constructor(scope: Construct, id: string, props: DataProductAssetCustomResourceProps) {
    super(scope, id);

    const {
      dataProductCataloguePath, customResourceLambda, dataProductNameObjectKey
    } = props;
    const lambdaId = 'DataProductAssetCustomResource';

    const dataProductObjectName = AssetName.dataProduct;
    const dataProductObject = JSON.parse(readFileSync(`${
      dataProductCataloguePath }/${ dataProductObjectName }`).toString()) as DataProductObject;

    const dataProductProducerInfoObjectName = AssetName.dataProductProducerInfo;
    const dataProductProducerInfoObject = JSON.parse(readFileSync(`${
      dataProductCataloguePath }/${ dataProductProducerInfoObjectName }`).toString()) as DataProductProducerInfoObject;

    const dataProductInputsObjectName = AssetName.dataProductInputs;
    const dataProductInputsObject = JSON.parse(readFileSync(`${
      dataProductCataloguePath }/${ dataProductInputsObjectName }`).toString()) as DataProductInputsObject;

    const dataProductOutputsObjectName = AssetName.dataProductOutputs;
    const dataProductOutputsObject = JSON.parse(readFileSync(`${
      dataProductCataloguePath }/${ dataProductOutputsObjectName }`).toString()) as DataProductOutputsObject;

    const dataProductVisibilityObjectName = AssetName.dataProductVisibility;
    const dataProductVisibilityObject = JSON.parse(readFileSync(`${
      dataProductCataloguePath }/${ dataProductVisibilityObjectName }`).toString()) as DataProductVisibilityObject;

    const dataProductConsumersObjectName = AssetName.dataProductConsumers;
    const dataProductConsumersObject = JSON.parse(readFileSync(`${
      dataProductCataloguePath }/${ dataProductConsumersObjectName }`).toString()) as DataProductConsumersObject;

    const customResourceType = 'Custom::DataProductAsset';

    this.dataProductCR = new CfnResource(this, `${ lambdaId }-DataProduct`, {
      type: customResourceType,
      properties: {
        ServiceToken: customResourceLambda.functionArn,
        dataProductNameObjectKey,
        assetName: dataProductObjectName,
        ...dataProductObject
      }
    });

    this.dataProductCR = new CfnResource(this, `${ lambdaId }-DataProductProducerInfo`, {
      type: customResourceType,
      properties: {
        ServiceToken: customResourceLambda.functionArn,
        dataProductNameObjectKey,
        assetName: dataProductProducerInfoObjectName,
        ...dataProductProducerInfoObject
      }
    });

    this.dataProductCR = new CfnResource(this, `${ lambdaId }-DataProductInputs`, {
      type: customResourceType,
      properties: {
        ServiceToken: customResourceLambda.functionArn,
        dataProductNameObjectKey,
        assetName: dataProductInputsObjectName,
        ...dataProductInputsObject
      }
    });

    this.dataProductCR = new CfnResource(this, `${ lambdaId }-DataProductOutputs`, {
      type: customResourceType,
      properties: {
        ServiceToken: customResourceLambda.functionArn,
        dataProductNameObjectKey,
        assetName: dataProductOutputsObjectName,
        ...dataProductOutputsObject
      }
    });

    this.dataProductVisibilityCR = new CfnResource(this, `${ lambdaId }-DataProductVisibility`, {
      type: customResourceType,
      properties: {
        ServiceToken: customResourceLambda.functionArn,
        dataProductNameObjectKey,
        assetName: dataProductVisibilityObjectName,
        ...dataProductVisibilityObject
      }
    });

    this.dataProductConsumersCR = new CfnResource(this, `${ lambdaId }-DataProductConsumers`, {
      type: customResourceType,
      properties: {
        ServiceToken: customResourceLambda.functionArn,
        dataProductNameObjectKey,
        assetName: dataProductConsumersObjectName,
        ...dataProductConsumersObject
      }
    });
  }
}
