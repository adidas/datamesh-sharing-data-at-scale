import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { CreateDataProductLFTagChain } from '../../../../cdk/lib/create-data-product-lf-tag/chain';
import { CreateDataProductLFTagLambda } from '../../../../cdk/lib/create-data-product-lf-tag/lambda';
import {
  CreateDataProductLFTag, CreateDataProductLFTagProps
} from '../../../../cdk/lib/create-data-product-lf-tag/create-data-product-lf-tag';

const basicStackId = 'CreateDataProductLFTag';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const stackBaseProps: CreateDataProductLFTagProps = {
  deploymentEnvironment,
  stackBaseName
};
const lambdaMock = jest.fn();

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/create-data-product-lf-tag/lambda', () => ({
  CreateDataProductLFTagLambda: jest.fn(() => ({ lambda: lambdaMock }))
}));
jest.mock('../../../../cdk/lib/create-data-product-lf-tag/chain', () => ({
  CreateDataProductLFTagChain: jest.fn() }));

describe('# CreateDataProductLFTag', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new CreateDataProductLFTag(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a CreateDataProductLFTagLambda construct', (done) => {
    const constructId = 'CreateDataProductLFTagLambda';
    const construct = new CreateDataProductLFTag(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(CreateDataProductLFTagLambda).toHaveBeenCalledTimes(1);
    expect(CreateDataProductLFTagLambda).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a CreateDataProductLFTagChain construct', (done) => {
    const constructId = 'CreateDataProductLFTagChain';
    const construct = new CreateDataProductLFTag(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupChain(failedChain, successChain);

    expect(CreateDataProductLFTagChain).toHaveBeenCalledTimes(1);
    expect(CreateDataProductLFTagChain).toHaveBeenCalledWith(construct, constructId, {
      createDataProductLFTagLambda: lambdaMock, successChain, failedChain
    });
    expect(newChain).toEqual(getMockObject(CreateDataProductLFTagChain).mock.instances[0]);

    done();
  });
});
