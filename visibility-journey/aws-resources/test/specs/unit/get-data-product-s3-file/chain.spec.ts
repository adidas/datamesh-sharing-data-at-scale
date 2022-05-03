import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { EvaluateExpression, LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  GetDataProductS3FilesChain, GetDataProductS3FilesChainProps
} from '../../../../cdk/lib/get-data-product-s3-file/chain';

const lambdaInvokeId = 'Get Data Product S3 Files';
const basicStackId = 'GetDataProductS3FilesChain';
const lambdaMock: any = jest.fn();
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const stackBaseProps: GetDataProductS3FilesChainProps = {
  getDataProductS3FilesLambda: lambdaMock,
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

describe('# GetDataProductS3FilesChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new GetDataProductS3Files lambda invoke successfully', (done) => {
    const construct = new GetDataProductS3FilesChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledWith(construct, lambdaInvokeId, {
      inputPath: '$.dataProductName',
      resultPath: '$',
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
    const construct = new GetDataProductS3FilesChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(EvaluateExpression).toHaveBeenCalledTimes(1);
    expect(EvaluateExpression).toHaveBeenCalledWith(construct, 'Create Glue LF Database Name', {
      /* eslint-disable no-template-curly-in-string */
      expression: '`${ $.dataProductObject.data-product-name }_lf`',
      resultPath: '$.glueDatabaseName'
    });

    done();
  });

  it('Should create a new GetDataProductS3FilesChain successfully', (done) => {
    new GetDataProductS3FilesChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(lambdaInvokeStepMock);
    expect(firstNextMock).toHaveBeenCalledTimes(1);
    expect(firstNextMock).toHaveBeenCalledWith(getMockObject(EvaluateExpression).mock.instances[0]);
    expect(secondNextMock).toHaveBeenCalledTimes(1);
    expect(secondNextMock).toHaveBeenCalledWith(successChain);

    done();
  });
});
