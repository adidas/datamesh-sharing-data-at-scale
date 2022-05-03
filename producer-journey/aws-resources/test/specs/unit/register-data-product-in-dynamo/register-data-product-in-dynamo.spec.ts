import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { RegisterDataProductInDynamoChain } from '../../../../cdk/lib/register-data-product-in-dynamo/chain';
import { RegisterDataProductInDynamoLambda } from '../../../../cdk/lib/register-data-product-in-dynamo/lambda';
import {
  RegisterDataProductInDynamo, RegisterDataProductInDynamoProps
} from '../../../../cdk/lib/register-data-product-in-dynamo/register-data-product-in-dynamo';

const basicStackId = 'RegisterDataProductInDynamo';
const dataProductCatalogTable: any = {};
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const lambdaMock: any = jest.fn();
const stackBaseProps: RegisterDataProductInDynamoProps = {
  dataProductCatalogTable,
  deploymentEnvironment,
  stackBaseName
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/register-data-product-in-dynamo/lambda', () => ({
  RegisterDataProductInDynamoLambda: jest.fn(() => ({ lambda: lambdaMock }))
}));
jest.mock('../../../../cdk/lib/register-data-product-in-dynamo/chain', () => ({
  RegisterDataProductInDynamoChain: jest.fn() }));

describe('# RegisterDataProductInDynamo', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new RegisterDataProductInDynamo(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a RegisterDataProductInDynamoLambda construct', (done) => {
    const constructId = 'RegisterDataProductInDynamoLambda';
    const construct = new RegisterDataProductInDynamo(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(RegisterDataProductInDynamoLambda).toHaveBeenCalledTimes(1);
    expect(RegisterDataProductInDynamoLambda).toHaveBeenCalledWith(construct, constructId, {
      dataProductCatalogTable,
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a RegisterDataProductInDynamoChain construct', (done) => {
    const constructId = 'RegisterDataProductInDynamoChain';
    const construct = new RegisterDataProductInDynamo(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupChain(failedChain, successChain);

    expect(RegisterDataProductInDynamoChain).toHaveBeenCalledTimes(1);
    expect(RegisterDataProductInDynamoChain).toHaveBeenCalledWith(construct, constructId, {
      registerDataProductInDynamoLambda: lambdaMock, failedChain, successChain
    });
    expect(newChain).toEqual(getMockObject(RegisterDataProductInDynamoChain).mock.instances[0]);

    done();
  });
});
