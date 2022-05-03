import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { GrantAccessToConsumerChain } from '../../../../cdk/lib/grant-access-to-consumer/chain';
import { GrantAccessToConsumer } from '../../../../cdk/lib/grant-access-to-consumer/grant-access-to-consumer';
import { GrantAccessToConsumerLambda } from '../../../../cdk/lib/grant-access-to-consumer/lambda';

const basicStackId = 'ConsumerJourney';
const deploymentEnvironment: any = 'dev';
const stackBaseName = 'adidas-Consumer-Journey';
const stackBaseProps = {
  deploymentEnvironment,
  stackBaseName
};
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const grantAccessToConsumerLambda = 'GrantAccessToConsumerLambda';

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/grant-access-to-consumer/chain', () => ({
  GrantAccessToConsumerChain: jest.fn()
}));
jest.mock('../../../../cdk/lib/grant-access-to-consumer/lambda', () => ({
  GrantAccessToConsumerLambda: jest.fn(() => ({ lambda: grantAccessToConsumerLambda }))
}));

describe('# GrantAccessToConsumer', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new GrantAccessToConsumer(mockedStack, basicStackId, stackBaseProps);

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a GrantAccessToConsumerLambda construct', (done) => {
    const constructId = 'GrantAccessToConsumerLambda';
    const construct = new GrantAccessToConsumer(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(GrantAccessToConsumerLambda).toHaveBeenCalledTimes(1);
    expect(GrantAccessToConsumerLambda).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a GrantAccessToConsumerChain construct', (done) => {
    const constructId = 'GrantAccessToConsumerChain';
    const construct = new GrantAccessToConsumer(mockedStack, basicStackId, stackBaseProps);

    const newChain = construct.setupChain(successChain);

    expect(GrantAccessToConsumerChain).toHaveBeenCalledTimes(1);
    expect(GrantAccessToConsumerChain).toHaveBeenCalledWith(construct, constructId, {
      successChain, grantAccessToConsumerLambda
    });
    expect(newChain).toEqual(getMockObject(GrantAccessToConsumerChain).mock.instances[0]);

    done();
  });
});
