import { Construct, Fn, Stack } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  DataProductCatalogueS3, DataProductCatalogueS3Props
} from '../../../../../cdk/lib/catalogue-assets-main-stack/s3';

const constructId = 'DataProductCatalogueS3';
const mockedStack: any = jest.fn();
const deploymentEnvironment = 'dev';
const constructProps: DataProductCatalogueS3Props = {
  deploymentEnvironment
};

jest.mock('@aws-cdk/core', () => ({
  Fn: { select: jest.fn(), split: jest.fn() }, Stack: { of: jest.fn(() => ({ stackId: 'stackId' })) },
  Construct: jest.fn(), RemovalPolicy: { RETAIN: 'RETAIN', DESTROY: 'DESTROY' }
}));
jest.mock('@aws-cdk/aws-s3', () => ({ Bucket: jest.fn() }));
jest.mock('@adidas-data-mesh/common', () => ({ PROD_DEPLOYMENT_ENVIRONMENT: 'prod', DEV_DEPLOYMENT_ENVIRONMENT: 'dev' }));

describe('# DataProductCatalogueS3', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    const construct = new DataProductCatalogueS3(mockedStack, constructId, constructProps);

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Construct).toHaveBeenCalledWith(mockedStack, constructId);
    expect(Bucket).toHaveBeenCalledTimes(1);
    expect(Stack.of).toHaveBeenCalledTimes(1);
    expect(Stack.of).toHaveBeenCalledWith(construct);
    expect(Fn.select).toHaveBeenCalledTimes(2);
    expect(Fn.select).toHaveBeenNthCalledWith(1, 2, getMockObject(Fn.split).mock.results[0].value);
    expect(Fn.select).toHaveBeenNthCalledWith(2, 0, getMockObject(Fn.split).mock.results[1].value);
    expect(Fn.split).toHaveBeenCalledTimes(2);
    expect(Fn.split).toHaveBeenNthCalledWith(1, '/', 'stackId');
    expect(Fn.split).toHaveBeenNthCalledWith(2, '-', getMockObject(Fn.select).mock.results[0].value);

    done();
  });

  it('Should create a DataProductCatalogueS3', (done) => {
    const construct = new DataProductCatalogueS3(
      mockedStack, constructId, constructProps
    );
    const stackHashIdSuffix = getMockObject(Fn.select).mock.results[1].value;

    expect(Bucket).toHaveBeenCalledWith(construct, 'DataProductCatalogueBucket', {
      bucketName: `adidas-data-product-catalogue-${ stackHashIdSuffix }`,
      removalPolicy: 'RETAIN',
      versioned: true
    });

    done();
  });

  it('Should create a DataProductCatalogueS3 bucket with destroy policy and no versioned if it is feature branch', (done) => {
    const newDeploymentEnvironment = 'adidas-1';
    const construct = new DataProductCatalogueS3(
      mockedStack, constructId, {
        ...constructProps,
        deploymentEnvironment: newDeploymentEnvironment
      }
    );
    const stackHashIdSuffix = getMockObject(Fn.select).mock.results[1].value;

    expect(Bucket).toHaveBeenCalledWith(construct, 'DataProductCatalogueBucket', {
      bucketName: `adidas-data-product-catalogue-${ newDeploymentEnvironment }-${ stackHashIdSuffix }`,
      removalPolicy: 'DESTROY',
      versioned: false
    });

    done();
  });
});
