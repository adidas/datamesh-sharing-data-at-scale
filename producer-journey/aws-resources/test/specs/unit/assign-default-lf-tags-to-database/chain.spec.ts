import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  AssignDefaultLFTagsToDatabaseChain, AssignDefaultLFTagsToDatabaseChainProps
} from '../../../../cdk/lib/assign-default-lf-tags-to-database/chain';

const lambdaInvokeId = 'Assign Default LF Tags To Database';
const basicStackId = 'AssignDefaultLFTagsToDatabaseChain';
const lambdaMock: any = jest.fn();
const successChain: any = jest.fn();
const stackBaseProps: AssignDefaultLFTagsToDatabaseChainProps = {
  assignDefaultLFTagsToDatabaseLambda: lambdaMock,
  successChain
};
const mockedStack: any = jest.fn();
const nextMock = jest.fn();

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  JsonPath: { DISCARD: 'JsonPathDISCARD' },
  Chain: { start: jest.fn(() => ({ next: nextMock })) }
}));
jest.mock('@aws-cdk/aws-stepfunctions-tasks', () => ({ LambdaInvoke: jest.fn() }));

describe('# AssignDefaultLFTagsToDatabaseChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new AssignDefaultLFTagsToDatabase lambda invoke successfully', (done) => {
    const construct = new AssignDefaultLFTagsToDatabaseChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledWith(construct, lambdaInvokeId, {
      resultPath: 'JsonPathDISCARD',
      lambdaFunction: lambdaMock,
      payloadResponseOnly: true
    });

    done();
  });

  it('Should create a new AssignDefaultLFTagsToDatabaseChain successfully', (done) => {
    new AssignDefaultLFTagsToDatabaseChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(getMockObject(LambdaInvoke).mock.instances[0]);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(successChain);

    done();
  });
});
