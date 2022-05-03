import { Construct } from '@aws-cdk/core';
import { DataProductAssetCustomResource } from '../../../cdk/lib/data-product-asset-custom-resource/custom-resource';
import { DataProductAssetsSetup, DataProductAssetsSetupProps } from '../../../cdk/lib/data-product-assets-setup';

const basicStackId = 'DataProductAssetsSetup';
const deploymentEnvironment = 'dev';
const dataProductCataloguePath = 'dataProductCataloguePath';
const dataProductNameObjectKey = 'dataProductNameObjectKey';
const stackBaseName = 'adidas-Catalogue';
const mockedStack: any = jest.fn();
const customResourceLambdaMock: any = jest.fn();
const stackBaseProps: DataProductAssetsSetupProps = {
  deploymentEnvironment,
  stackBaseName,
  dataProductCataloguePath,
  dataProductNameObjectKey,
  customResourceLambda: customResourceLambdaMock
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../cdk/lib/data-product-asset-custom-resource/custom-resource', () => ({
  DataProductAssetCustomResource: jest.fn() }));

describe('# DataProductAssetsSetup', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new DataProductAssetsSetup(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a DataProductAssetCustomResource construct', (done) => {
    const constructId = 'DataProductAssetCustomResource';
    const construct = new DataProductAssetsSetup(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(DataProductAssetCustomResource).toHaveBeenCalledTimes(1);
    expect(DataProductAssetCustomResource).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      dataProductCataloguePath,
      customResourceLambda: customResourceLambdaMock,
      dataProductNameObjectKey
    });

    done();
  });
});
