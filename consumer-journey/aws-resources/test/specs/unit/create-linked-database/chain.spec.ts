import { Construct } from '@aws-cdk/core';
import { Chain, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { EvaluateExpression, LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  CreateLinkedDatabaseChain, CreateLinkedDatabaseChainProps
} from '../../../../cdk/lib/create-linked-database/chain';

const basicStackId = 'CreateLinkedDatabaseChain';
const successChain: any = jest.fn();
const createLinkedDatabaseLambda: any = 'CreateLinkedDatabaseLambda';
const stackBaseProps: CreateLinkedDatabaseChainProps = {
  createLinkedDatabaseLambda,
  successChain
};
const mockedStack: any = jest.fn();
const secondNextMock = jest.fn();
const firstNextMock = jest.fn(() => ({ next: secondNextMock }));

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  Chain: { start: jest.fn(() => ({ next: firstNextMock })) },
  JsonPath: { DISCARD: 'JsonPathDISCARD' }
}));
jest.mock('@aws-cdk/aws-stepfunctions-tasks', () => ({
  LambdaInvoke: jest.fn(),
  EvaluateExpression: jest.fn()
}));

describe('# CreateLinkedDatabaseChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new LambdaInvoke successfully', (done) => {
    const constructId = 'Create Linked Database';
    const construct = new CreateLinkedDatabaseChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledWith(construct, constructId, {
      inputPath: '$.currentConsumer',
      resultPath: JsonPath.DISCARD,
      lambdaFunction: createLinkedDatabaseLambda,
      payloadResponseOnly: true
    });

    done();
  });

  it('Should create a new EvaluateExpression successfully', (done) => {
    const constructId = 'Create Linked Database Name';
    const construct = new CreateLinkedDatabaseChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(EvaluateExpression).toHaveBeenCalledTimes(1);
    expect(EvaluateExpression).toHaveBeenNthCalledWith(1, construct, constructId, {
      // eslint-disable-next-line no-template-curly-in-string
      expression: '`${ $.dataProductObject.data-product-name }_lf`',
      resultPath: '$.currentConsumer.databaseName'
    });

    done();
  });

  it('Should create a new CreateLinkedDatabaseChain successfully', (done) => {
    new CreateLinkedDatabaseChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(getMockObject(LambdaInvoke).mock.instances[0]);
    expect(firstNextMock).toHaveBeenCalledTimes(1);
    expect(firstNextMock).toHaveBeenCalledWith(getMockObject(EvaluateExpression).mock.instances[0]);
    expect(secondNextMock).toHaveBeenCalledTimes(1);
    expect(secondNextMock).toHaveBeenCalledWith(successChain);

    done();
  });
});
