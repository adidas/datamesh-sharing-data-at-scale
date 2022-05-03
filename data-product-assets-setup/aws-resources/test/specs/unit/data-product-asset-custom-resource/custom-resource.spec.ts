import { readFileSync } from 'fs';
import { CfnResource, Construct } from '@aws-cdk/core';
import {
  DataProductAssetCustomResource, DataProductAssetCustomResourceProps
} from '../../../../cdk/lib/data-product-asset-custom-resource/custom-resource';
import {
  DataProductConsumersObject, DataProductInputsObject, DataProductObject, DataProductOutputsObject,
  DataProductProducerInfoObject, DataProductVisibilityObject
} from '../../../../cdk/lib/data-product-asset-custom-resource/config/data-product-assets.model';

const basicStackId = 'DataProductAssetCustomResource';
const lambdaId = 'DataProductAssetCustomResource';
const customResourceType = 'Custom::DataProductAsset';
const deploymentEnvironment = 'dev';
const dataProductCataloguePath = 'dataProductCataloguePath';
const dataProductNameObjectKey = 'dataProductNameObjectKey';
const mockedStack: any = jest.fn();
const customResourceLambdaMock: any = {
  functionArn: 'functionArn'
};
const stackBaseProps: DataProductAssetCustomResourceProps = {
  deploymentEnvironment,
  dataProductNameObjectKey,
  dataProductCataloguePath,
  customResourceLambda: customResourceLambdaMock
};
const toStringMock = jest.fn();

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn(), CfnResource: jest.fn() }));
jest.mock('@aws-cdk/aws-iam', () => ({ PolicyStatement: jest.fn() }));
jest.mock('fs', () => ({ readFileSync: jest.fn(() => ({ toString: toStringMock })) }));

describe('# DataProductAssetCustomResource Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a DataProduct custom resource', (done) => {
    const assetName = 'data-product.json';
    const cfnResourceId = `${ lambdaId }-DataProduct`;

    const fullFilePath = `${ dataProductCataloguePath }/${ assetName }`;

    const dataObject: DataProductObject = {
      'data-product-name': 'data-product-name',
      'data-product-owner': 'data-product-owner',
      'data-product-mantainer': 'data-product-mantainer',
      'edc-data-objects': [ 'edc-data-objects' ],
      'source-system': 'source-system',
      'enterprise-system-landscape-information-tracker': 'enterprise-system-landscape-information-tracker',
      'dq-rules': 'dq-rules',
      'usage-patterns': [ 'usage-patterns' ],
      'version': 'version'
    };

    toStringMock.mockReturnValue(JSON.stringify(dataObject));

    const construct = new DataProductAssetCustomResource(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(toStringMock).toHaveBeenCalledTimes(6);
    expect(readFileSync).toHaveBeenCalledTimes(6);

    expect(readFileSync).toHaveBeenNthCalledWith(1, fullFilePath);
    expect(CfnResource).toHaveBeenCalledTimes(6);
    expect(CfnResource).toHaveBeenNthCalledWith(1, construct, cfnResourceId, {
      type: customResourceType,
      properties: {
        ServiceToken: customResourceLambdaMock.functionArn,
        dataProductNameObjectKey,
        assetName,
        ...dataObject
      }
    });

    done();
  });

  it('Should create a DataProductProducerInfo custom resource', (done) => {
    const assetName = 'data-product-producer-info.json';
    const cfnResourceId = `${ lambdaId }-DataProductProducerInfo`;

    const fullFilePath = `${ dataProductCataloguePath }/${ assetName }`;

    const dataObject: DataProductProducerInfoObject = {
      'account-type': 'aws',
      'producer-role-arn': 'producer-role-arn',
      'producer-account-id': 'producer-account-id',
      'bucket-name': 'bucket-name'
    };

    toStringMock.mockReturnValue(JSON.stringify(dataObject));

    const construct = new DataProductAssetCustomResource(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(toStringMock).toHaveBeenCalledTimes(6);
    expect(readFileSync).toHaveBeenCalledTimes(6);

    expect(readFileSync).toHaveBeenNthCalledWith(2, fullFilePath);
    expect(CfnResource).toHaveBeenCalledTimes(6);
    expect(CfnResource).toHaveBeenNthCalledWith(2, construct, cfnResourceId, {
      type: customResourceType,
      properties: {
        ServiceToken: customResourceLambdaMock.functionArn,
        dataProductNameObjectKey,
        assetName,
        ...dataObject
      }
    });

    done();
  });

  it('Should create a DataProductInputs custom resource', (done) => {
    const assetName = 'data-product-inputs.json';
    const cfnResourceId = `${ lambdaId }-DataProductInputs`;

    const fullFilePath = `${ dataProductCataloguePath }/${ assetName }`;

    const dataObject: DataProductInputsObject = {
      inputs: {
        BDP: {
          tables: [ 'tables' ]
        }
      }
    };

    toStringMock.mockReturnValue(JSON.stringify(dataObject));

    const construct = new DataProductAssetCustomResource(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(toStringMock).toHaveBeenCalledTimes(6);
    expect(readFileSync).toHaveBeenCalledTimes(6);

    expect(readFileSync).toHaveBeenNthCalledWith(3, fullFilePath);
    expect(CfnResource).toHaveBeenCalledTimes(6);
    expect(CfnResource).toHaveBeenNthCalledWith(3, construct, cfnResourceId, {
      type: customResourceType,
      properties: {
        ServiceToken: customResourceLambdaMock.functionArn,
        dataProductNameObjectKey,
        assetName,
        ...dataObject
      }
    });

    done();
  });

  it('Should create a DataProductOutputs custom resource', (done) => {
    const assetName = 'data-product-outputs.json';
    const cfnResourceId = `${ lambdaId }-DataProductOutputs`;

    const fullFilePath = `${ dataProductCataloguePath }/${ assetName }`;

    const dataObject: DataProductOutputsObject = {
      outputs: {
        'table-name': {
          'file-format': 'parquet',
          'port-type': 'blob',
          'location': 'location',
          'partition-columns': [ 'partition-columns' ],
          'retention-time': {
            unit: 'day',
            time: 2
          }
        }
      }
    };

    toStringMock.mockReturnValue(JSON.stringify(dataObject));

    const construct = new DataProductAssetCustomResource(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(toStringMock).toHaveBeenCalledTimes(6);
    expect(readFileSync).toHaveBeenCalledTimes(6);

    expect(readFileSync).toHaveBeenNthCalledWith(4, fullFilePath);
    expect(CfnResource).toHaveBeenCalledTimes(6);
    expect(CfnResource).toHaveBeenNthCalledWith(4, construct, cfnResourceId, {
      type: customResourceType,
      properties: {
        ServiceToken: customResourceLambdaMock.functionArn,
        dataProductNameObjectKey,
        assetName,
        ...dataObject
      }
    });

    done();
  });

  it('Should create a DataProductVisibility custom resource', (done) => {
    const assetName = 'data-product-visibility.json';
    const cfnResourceId = `${ lambdaId }-DataProductVisibility`;

    const fullFilePath = `${ dataProductCataloguePath }/${ assetName }`;

    const dataObject: DataProductVisibilityObject = {
      tables: [
        {
          name: 'foo',
          visibility: 'internal',
          columns: [
            {
              name: 'bar',
              pci: true
            }
          ]
        }
      ]
    };

    toStringMock.mockReturnValue(JSON.stringify(dataObject));

    const construct = new DataProductAssetCustomResource(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(toStringMock).toHaveBeenCalledTimes(6);
    expect(readFileSync).toHaveBeenCalledTimes(6);

    expect(readFileSync).toHaveBeenNthCalledWith(5, fullFilePath);
    expect(CfnResource).toHaveBeenCalledTimes(6);
    expect(CfnResource).toHaveBeenNthCalledWith(5, construct, cfnResourceId, {
      type: customResourceType,
      properties: {
        ServiceToken: customResourceLambdaMock.functionArn,
        dataProductNameObjectKey,
        assetName,
        ...dataObject
      }
    });

    done();
  });

  it('Should create a DataProductConsumers custom resource', (done) => {
    const assetName = 'data-product-consumers.json';
    const cfnResourceId = `${ lambdaId }-DataProductConsumers`;

    const fullFilePath = `${ dataProductCataloguePath }/${ assetName }`;

    const dataObject: DataProductConsumersObject = {
      consumers: [
        {
          'account': '123456789123',
          'contact': 'foo.bar@adidas.com',
          'team': 'pdna',
          'enterprise-system-landscape-information-tracker': 'foobar',
          'type': 'iam',
          'consumer-role-arn': 'arn:aws:iam::123456789123:role/consumer'
        }
      ]
    };

    toStringMock.mockReturnValue(JSON.stringify(dataObject));

    const construct = new DataProductAssetCustomResource(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(toStringMock).toHaveBeenCalledTimes(6);
    expect(readFileSync).toHaveBeenCalledTimes(6);

    expect(readFileSync).toHaveBeenNthCalledWith(6, fullFilePath);
    expect(CfnResource).toHaveBeenCalledTimes(6);
    expect(CfnResource).toHaveBeenNthCalledWith(6, construct, cfnResourceId, {
      type: customResourceType,
      properties: {
        ServiceToken: customResourceLambdaMock.functionArn,
        dataProductNameObjectKey,
        assetName,
        ...dataObject
      }
    });

    done();
  });
});
