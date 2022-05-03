import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import {
  RegisterDataProductInDynamoChain, RegisterDataProductInDynamoChainProps
} from '../../../../cdk/lib/register-data-product-in-dynamo/chain';

const lambdaInvokeId = 'Register Data Product In Dynamo';
const basicStackId = 'RegisterDataProductInDynamoChain';
const lambdaMock: any = jest.fn();
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const stackBaseProps: RegisterDataProductInDynamoChainProps = {
  registerDataProductInDynamoLambda: lambdaMock,
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
  Chain: { start: jest.fn(() => ({ next: nextMock })) }
}));
jest.mock('@aws-cdk/aws-stepfunctions-tasks', () => ({ LambdaInvoke: jest.fn(() => ({ addRetry: addRetryMock })) }));

describe('# RegisterDataProductInDynamoChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new RegisterDataProductInDynamo lambda invoke successfully', (done) => {
    const construct = new RegisterDataProductInDynamoChain(
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

  it('Should create a new RegisterDataProductInDynamoChain successfully', (done) => {
    new RegisterDataProductInDynamoChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(lambdaInvokeStepMock);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(successChain);

    done();
  });
});
