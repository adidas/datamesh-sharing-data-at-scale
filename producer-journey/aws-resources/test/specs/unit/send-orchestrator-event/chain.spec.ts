import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { EvaluateExpression, LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  EventSources, SendOrchestratorEventChain, SendOrchestratorEventChainProps
} from '../../../../cdk/lib/send-orchestrator-event/chain';

const lambdaInvokeId = 'Send Orchestrator Event';
const basicStackId = 'SendOrchestratorEventChain';
const lambdaMock: any = jest.fn();
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const stackBaseProps: SendOrchestratorEventChainProps = {
  sendOrchestratorEventLambda: lambdaMock,
  failedChain,
  successChain
};
const mockedStack: any = jest.fn();
const secondNextMock = jest.fn();
const firstNextMock = jest.fn(() => ({ next: secondNextMock }));
const lambdaInvokeStepMock = jest.fn();
const addCatchMock = jest.fn().mockReturnValue(lambdaInvokeStepMock);
const addRetryMock = jest.fn(() => ({ addCatch: addCatchMock }));

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  JsonPath: { DISCARD: 'JsonPathDISCARD' },
  Chain: { start: jest.fn(() => ({ next: firstNextMock })) }
}));
jest.mock('@aws-cdk/aws-stepfunctions-tasks', () => ({
  LambdaInvoke: jest.fn(() => ({ addRetry: addRetryMock })), EvaluateExpression: jest.fn()
}));

describe('# SendOrchestratorEventChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new SendOrchestratorEvent lambda invoke successfully', (done) => {
    const construct = new SendOrchestratorEventChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledWith(construct, lambdaInvokeId, {
      inputPath: '$',
      resultPath: 'JsonPathDISCARD',
      lambdaFunction: lambdaMock,
      payloadResponseOnly: true
    });
    expect(addRetryMock).toHaveBeenCalledTimes(1);
    expect(addRetryMock).toHaveBeenCalledWith({ maxAttempts: 1 });
    expect(addCatchMock).toHaveBeenCalledTimes(1);
    expect(addCatchMock).toHaveBeenCalledWith(failedChain, { resultPath: '$.error' });

    done();
  });

  it('Should create EvaluateExpressions lambda invoke successfully', (done) => {
    const construct = new SendOrchestratorEventChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(EvaluateExpression).toHaveBeenCalledTimes(1);
    expect(EvaluateExpression).toHaveBeenCalledWith(construct, 'Set Journey Source', {
      expression: `\`${ EventSources.producer }\``,
      resultPath: '$.journeySource'
    });

    done();
  });

  it('Should create a new SendOrchestratorEventChain successfully', (done) => {
    new SendOrchestratorEventChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(getMockObject(EvaluateExpression).mock.instances[0]);
    expect(firstNextMock).toHaveBeenCalledTimes(1);
    expect(firstNextMock).toHaveBeenCalledWith(lambdaInvokeStepMock);
    expect(secondNextMock).toHaveBeenCalledTimes(1);
    expect(secondNextMock).toHaveBeenCalledWith(successChain);

    done();
  });
});
