import { Construct } from '@aws-cdk/core';
import { Chain, TaskInput } from '@aws-cdk/aws-stepfunctions';
import { SqsSendMessage } from '@aws-cdk/aws-stepfunctions-tasks';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  UpdateGlueCatalogPolicyChain, UpdateGlueCatalogPolicyChainProps
} from '../../../../cdk/lib/update-glue-catalog-policy/chain';

const basicStackId = 'UpdateGlueCatalogPolicyChain';
const successChain: any = jest.fn();
const sqsMock: any = jest.fn();
const stackBaseProps: UpdateGlueCatalogPolicyChainProps = {
  updateGlueCatalogPolicySqs: sqsMock,
  successChain
};
const mockedStack: any = jest.fn();
const nextMock = jest.fn();
const lambdaInvokeMock = jest.fn();
const addRetryMock = jest.fn().mockReturnValue(lambdaInvokeMock);

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  Chain: { start: jest.fn(() => ({ next: nextMock })) },
  TaskInput: { fromJsonPathAt: jest.fn() },
  JsonPath: { DISCARD: 'JsonPathDISCARD' }
}));
jest.mock('@aws-cdk/aws-stepfunctions-tasks', () => ({
  SqsSendMessage: jest.fn(() => ({ addRetry: addRetryMock }))
}));

describe('# UpdateGlueCatalogPolicyChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new SqsSendMessage successfully', (done) => {
    const constructId = 'Update Glue Catalog Policy Lambda';
    const construct = new UpdateGlueCatalogPolicyChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(SqsSendMessage).toHaveBeenCalledTimes(1);
    expect(SqsSendMessage).toHaveBeenCalledWith(construct, constructId, {
      resultPath: 'JsonPathDISCARD',
      messageGroupId: '1',
      queue: sqsMock,
      messageBody: getMockObject(TaskInput.fromJsonPathAt).mock.results[0].value
    });
    expect(TaskInput.fromJsonPathAt).toHaveBeenCalledTimes(1);
    expect(TaskInput.fromJsonPathAt).toHaveBeenCalledWith('$.currentConsumer.account');

    done();
  });

  it('Should create a new UpdateGlueCatalogPolicyChain successfully', (done) => {
    new UpdateGlueCatalogPolicyChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(lambdaInvokeMock);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(successChain);

    done();
  });
});
