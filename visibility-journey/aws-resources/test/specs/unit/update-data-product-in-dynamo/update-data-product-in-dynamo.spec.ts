import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { UpdateDataProductInDynamoChain } from '../../../../cdk/lib/update-data-product-in-dynamo/chain';
import { UpdateDataProductInDynamoLambda } from '../../../../cdk/lib/update-data-product-in-dynamo/lambda';
import {
  UpdateDataProductInDynamo, UpdateDataProductInDynamoProps
} from '../../../../cdk/lib/update-data-product-in-dynamo/update-data-product-in-dynamo';

const basicStackId = 'UpdateDataProductInDynamo';
const dataProductCatalogTable: any = {};
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const lambdaMock: any = jest.fn();
const stackBaseProps: UpdateDataProductInDynamoProps = {
  dataProductCatalogTable,
  deploymentEnvironment,
  stackBaseName
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/update-data-product-in-dynamo/lambda', () => ({
  UpdateDataProductInDynamoLambda: jest.fn(() => ({ lambda: lambdaMock }))
}));
jest.mock('../../../../cdk/lib/update-data-product-in-dynamo/chain', () => ({
  UpdateDataProductInDynamoChain: jest.fn() }));

describe('# UpdateDataProductInDynamo', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new UpdateDataProductInDynamo(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a UpdateDataProductInDynamoLambda construct', (done) => {
    const constructId = 'UpdateDataProductInDynamoLambda';
    const construct = new UpdateDataProductInDynamo(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(UpdateDataProductInDynamoLambda).toHaveBeenCalledTimes(1);
    expect(UpdateDataProductInDynamoLambda).toHaveBeenCalledWith(construct, constructId, {
      dataProductCatalogTable,
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a UpdateDataProductInDynamoChain construct', (done) => {
    const constructId = 'UpdateDataProductInDynamoChain';
    const construct = new UpdateDataProductInDynamo(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupChain(failedChain, successChain);

    expect(UpdateDataProductInDynamoChain).toHaveBeenCalledTimes(1);
    expect(UpdateDataProductInDynamoChain).toHaveBeenCalledWith(construct, constructId, {
      updateDataProductInDynamoLambda: lambdaMock, failedChain, successChain
    });
    expect(newChain).toEqual(getMockObject(UpdateDataProductInDynamoChain).mock.instances[0]);

    done();
  });
});
