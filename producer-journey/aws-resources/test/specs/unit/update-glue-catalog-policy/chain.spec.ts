import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { Chain, TaskInput } from '@aws-cdk/aws-stepfunctions';
import { SqsSendMessage } from '@aws-cdk/aws-stepfunctions-tasks';
import {
  UpdateGlueCatalogPolicyChain, UpdateGlueCatalogPolicyChainProps
} from '../../../../cdk/lib/update-glue-catalog-policy/chain';

const lambdaInvokeId = 'Update Glue Catalog Policy';
const basicStackId = 'UpdateGlueCatalogPolicyChain';
const sqsMock: any = jest.fn();
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const stackBaseProps: UpdateGlueCatalogPolicyChainProps = {
  updateGlueCatalogPolicySqs: sqsMock,
  failedChain,
  successChain
};
const mockedStack: any = jest.fn();
const lambdaInvokeStepMock = jest.fn();
const nextMock = jest.fn();
const addCatchMock = jest.fn().mockReturnValue(lambdaInvokeStepMock);
const addRetryMock = jest.fn(() => ({ addCatch: addCatchMock }));

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  JsonPath: { DISCARD: 'JsonPathDISCARD' },
  TaskInput: { fromJsonPathAt: jest.fn() },
  Chain: { start: jest.fn(() => ({ next: nextMock })) }
}));
jest.mock('@aws-cdk/aws-stepfunctions-tasks', () => ({ SqsSendMessage: jest.fn(() => ({ addRetry: addRetryMock })) }));

describe('# UpdateGlueCatalogPolicyChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new UpdateGlueCatalogPolicy sqs event successfully', (done) => {
    const construct = new UpdateGlueCatalogPolicyChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(SqsSendMessage).toHaveBeenCalledTimes(1);
    expect(SqsSendMessage).toHaveBeenCalledWith(construct, lambdaInvokeId, {
      resultPath: 'JsonPathDISCARD',
      messageGroupId: '1',
      queue: sqsMock,
      messageBody: getMockObject(TaskInput.fromJsonPathAt).mock.results[0].value
    });
    expect(TaskInput.fromJsonPathAt).toHaveBeenCalledTimes(1);
    expect(TaskInput.fromJsonPathAt).toHaveBeenCalledWith('$.dataProductProducerInfoObject.producer-account-id');
    expect(addRetryMock).toHaveBeenCalledTimes(1);
    expect(addRetryMock).toHaveBeenCalledWith({ maxAttempts: 1 });
    expect(addCatchMock).toHaveBeenCalledTimes(1);
    expect(addCatchMock).toHaveBeenCalledWith(failedChain, { resultPath: '$.error' });

    done();
  });

  it('Should create a new UpdateGlueCatalogPolicyChain successfully', (done) => {
    new UpdateGlueCatalogPolicyChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(lambdaInvokeStepMock);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(successChain);

    done();
  });
});
