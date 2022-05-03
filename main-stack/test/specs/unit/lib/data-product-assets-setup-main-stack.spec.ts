import { Stack } from '@aws-cdk/core';
import { DataProductAssetsSetup } from '@adidas-data-mesh/data-product-assets-setup-cdk';
import { DataProductAssetsMainStack, StackBaseProps } from '../../../../cdk/lib/data-product-assets-setup-main-stack';

const basicStackId = 'DataProductAssetsMainStack';
const deploymentEnvironment = 'dev';
const dataProductCataloguePath = 'dataProductCataloguePath';
const dataProductNameObjectKey = 'dataProductNameObjectKey';
const stackBaseName = 'adidas-Catalogue';
const mockedStack: any = jest.fn();
const customResourceLambdaMock: any = jest.fn();
const stackBaseProps: StackBaseProps = {
  deploymentEnvironment,
  stackBaseName,
  dataProductCataloguePath,
  dataProductNameObjectKey,
  customResourceLambda: customResourceLambdaMock
};

jest.mock('@aws-cdk/core', () => ({ Stack: jest.fn() }));
jest.mock('@adidas-data-mesh/data-product-assets-setup-cdk', () => ({ DataProductAssetsSetup: jest.fn() }));

describe('# DataProductAssetsMainStack', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new DataProductAssetsMainStack(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Stack).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a DataProductAssetsSetup construct', (done) => {
    const constructId = 'DataProductAssetsSetup';
    const construct = new DataProductAssetsMainStack(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(DataProductAssetsSetup).toHaveBeenCalledTimes(1);
    expect(DataProductAssetsSetup).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName,
      dataProductCataloguePath,
      customResourceLambda: customResourceLambdaMock,
      dataProductNameObjectKey
    });

    done();
  });
});
