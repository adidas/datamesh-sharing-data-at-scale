import { Stack } from '@aws-cdk/core';
import { CatalogueAssetsMainStack, StackBaseProps } from '../../../../cdk/lib/catalogue-assets-main-stack';
import { DataProductCatalogueEvent } from '../../../../cdk/lib/catalogue-assets-main-stack/event-rule';
import { DataProductAssetsCRLambda } from '../../../../cdk/lib/catalogue-assets-main-stack/lambda';
import { DataProductCatalogueS3 } from '../../../../cdk/lib/catalogue-assets-main-stack/s3';

const basicStackId = 'CatalogueAssetsMainStack';
const deploymentEnvironment = 'dev';
const mockedStack: any = jest.fn();
const dataProductCatalogueBucketMock = jest.fn();
const dataProductCatalogueEventBusMock = jest.fn();
const stackBaseName = 'stackBaseName';
const stackBaseProps: StackBaseProps = {
  deploymentEnvironment,
  stackBaseName
};

jest.mock('@aws-cdk/core', () => ({ Stack: jest.fn() }));
jest.mock('../../../../cdk/lib/catalogue-assets-main-stack/s3', () => ({ DataProductCatalogueS3: jest.fn(() => ({
  dataProductCatalogueBucket: dataProductCatalogueBucketMock
})) }));
jest.mock('../../../../cdk/lib/catalogue-assets-main-stack/lambda', () => ({ DataProductAssetsCRLambda: jest.fn() }));
jest.mock('../../../../cdk/lib/catalogue-assets-main-stack/event-rule', () => ({
  DataProductCatalogueEvent: jest.fn(() => ({ eventBus: dataProductCatalogueEventBusMock })) }));

describe('# CatalogueAssetsMainStack', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new CatalogueAssetsMainStack(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Stack).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a DataProductCatalogueS3 construct', (done) => {
    const constructId = 'DataProductCatalogueS3';
    const construct = new CatalogueAssetsMainStack(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(DataProductCatalogueS3).toHaveBeenCalledTimes(1);
    expect(DataProductCatalogueS3).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment
    });

    done();
  });

  it('Should have a DataProductAssetsCRLambda construct', (done) => {
    const constructId = 'DataProductAssetsCRLambda';
    const construct = new CatalogueAssetsMainStack(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(DataProductAssetsCRLambda).toHaveBeenCalledTimes(1);
    expect(DataProductAssetsCRLambda).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName,
      dataProductCatalogueBucket: dataProductCatalogueBucketMock,
      dataProductCatalogueEventBus: dataProductCatalogueEventBusMock
    });

    done();
  });

  it('Should have a DataProductCatalogueEvent construct', (done) => {
    const constructId = 'DataProductCatalogueEvent';
    const construct = new CatalogueAssetsMainStack(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(DataProductCatalogueEvent).toHaveBeenCalledTimes(1);
    expect(DataProductCatalogueEvent).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment
    });

    done();
  });
});
