import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { GrantAccessToConsumerRoleChain } from '../../../../cdk/lib/grant-access-to-consumer-role/chain';
import { GrantAccessToConsumerRole } from '../../../../cdk/lib/grant-access-to-consumer-role/grant-access-to-consumer-role';
import { GrantAccessToConsumerRoleLambda } from '../../../../cdk/lib/grant-access-to-consumer-role/lambda';

const basicStackId = 'ConsumerJourney';
const deploymentEnvironment: any = 'dev';
const stackBaseName = 'adidas-Consumer-Journey';
const stackBaseProps = {
  deploymentEnvironment,
  stackBaseName
};
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const grantAccessToConsumerRoleLambda = 'GrantAccessToConsumerRoleLambda';

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/grant-access-to-consumer-role/chain', () => ({
  GrantAccessToConsumerRoleChain: jest.fn()
}));
jest.mock('../../../../cdk/lib/grant-access-to-consumer-role/lambda', () => ({
  GrantAccessToConsumerRoleLambda: jest.fn(() => ({ lambda: grantAccessToConsumerRoleLambda }))
}));

describe('# GrantAccessToConsumerRole', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new GrantAccessToConsumerRole(mockedStack, basicStackId, stackBaseProps);

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a GrantAccessToConsumerRoleLambda construct', (done) => {
    const constructId = 'GrantAccessToConsumerRoleLambda';
    const construct = new GrantAccessToConsumerRole(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(GrantAccessToConsumerRoleLambda).toHaveBeenCalledTimes(1);
    expect(GrantAccessToConsumerRoleLambda).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a GrantAccessToConsumerRoleChain construct', (done) => {
    const constructId = 'GrantAccessToConsumerRoleChain';
    const construct = new GrantAccessToConsumerRole(mockedStack, basicStackId, stackBaseProps);

    const newChain = construct.setupChain(successChain);

    expect(GrantAccessToConsumerRoleChain).toHaveBeenCalledTimes(1);
    expect(GrantAccessToConsumerRoleChain).toHaveBeenCalledWith(construct, constructId, {
      successChain, grantAccessToConsumerRoleLambda
    });
    expect(newChain).toEqual(getMockObject(GrantAccessToConsumerRoleChain).mock.instances[0]);

    done();
  });
});
