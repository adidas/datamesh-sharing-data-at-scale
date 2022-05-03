import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { GrantAccessToProducerChain } from '../../../../cdk/lib/grant-access-to-producer/chain';
import { GrantAccessToProducerLambda } from '../../../../cdk/lib/grant-access-to-producer/lambda';
import {
  GrantAccessToProducer, GrantAccessToProducerProps
} from '../../../../cdk/lib/grant-access-to-producer/grant-access-to-producer';

const basicStackId = 'GrantAccessToProducer';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const stackBaseProps: GrantAccessToProducerProps = {
  deploymentEnvironment,
  stackBaseName
};
const lambdaMock = jest.fn();

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/grant-access-to-producer/lambda', () => ({
  GrantAccessToProducerLambda: jest.fn(() => ({ lambda: lambdaMock }))
}));
jest.mock('../../../../cdk/lib/grant-access-to-producer/chain', () => ({
  GrantAccessToProducerChain: jest.fn() }));

describe('# GrantAccessToProducer', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new GrantAccessToProducer(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a GrantAccessToProducerLambda construct', (done) => {
    const constructId = 'GrantAccessToProducerLambda';
    const construct = new GrantAccessToProducer(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(GrantAccessToProducerLambda).toHaveBeenCalledTimes(1);
    expect(GrantAccessToProducerLambda).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a GrantAccessToProducerChain construct', (done) => {
    const constructId = 'GrantAccessToProducerChain';
    const construct = new GrantAccessToProducer(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupChain(successChain);

    expect(GrantAccessToProducerChain).toHaveBeenCalledTimes(1);
    expect(GrantAccessToProducerChain).toHaveBeenCalledWith(construct, constructId, {
      grantAccessToProducerLambda: lambdaMock, successChain
    });
    expect(newChain).toEqual(getMockObject(GrantAccessToProducerChain).mock.instances[0]);

    done();
  });
});
