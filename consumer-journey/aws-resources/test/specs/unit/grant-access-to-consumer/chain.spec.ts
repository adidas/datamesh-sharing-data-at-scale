import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  GrantAccessToConsumerChain, GrantAccessToConsumerChainProps
} from '../../../../cdk/lib/grant-access-to-consumer/chain';

const basicStackId = 'GrantAccessToConsumerChain';
const successChain: any = jest.fn();
const grantAccessToConsumerLambda: any = 'GrantAccessToConsumerLambda';
const stackBaseProps: GrantAccessToConsumerChainProps = {
  grantAccessToConsumerLambda,
  successChain
};
const mockedStack: any = jest.fn();
const nextMock = jest.fn();

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  Chain: { start: jest.fn(() => ({ next: nextMock })) },
  JsonPath: { DISCARD: 'JsonPathDISCARD' }
}));
jest.mock('@aws-cdk/aws-stepfunctions-tasks', () => ({
  LambdaInvoke: jest.fn()
}));

describe('# GrantAccessToConsumerChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new LambdaInvoke successfully', (done) => {
    const constructId = 'Grant Access to Consumer';
    const construct = new GrantAccessToConsumerChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledWith(construct, constructId, {
      inputPath: '$',
      resultPath: 'JsonPathDISCARD',
      lambdaFunction: grantAccessToConsumerLambda,
      payloadResponseOnly: true
    });

    done();
  });

  it('Should create a new GrantAccessToConsumerChain successfully', (done) => {
    new GrantAccessToConsumerChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(getMockObject(LambdaInvoke).mock.instances[0]);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(successChain);

    done();
  });
});
