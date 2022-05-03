import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { EvaluateExpression, LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  GetDataProductS3FilesChain, GetDataProductS3FilesChainProps
} from '../../../../cdk/lib/get-data-product-s3-file/chain';

const basicStackId = 'GetDataProductS3FileChain';
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const getDataProductS3FilesLambda: any = 'GetDataProductS3FilesLambda';
const stackBaseProps: GetDataProductS3FilesChainProps = {
  getDataProductS3FilesLambda,
  failedChain,
  successChain
};
const mockedStack: any = jest.fn();
const lambdaInvokeMock = jest.fn();
const thirdNextMock = jest.fn();
const secondNextMock = jest.fn(() => ({ next: thirdNextMock }));
const firstNextMock = jest.fn(() => ({ next: secondNextMock }));
const addCatchMock = jest.fn().mockReturnValue(lambdaInvokeMock);
const addRetryMock = jest.fn(() => ({ addCatch: addCatchMock }));

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  Chain: { start: jest.fn(() => ({ next: firstNextMock })) },
  JsonPath: { stringAt: jest.fn() }
}));
jest.mock('@aws-cdk/aws-stepfunctions-tasks', () => ({
  LambdaInvoke: jest.fn(() => ({ addRetry: addRetryMock })),
  EvaluateExpression: jest.fn()
}));

describe('# GetDataProductS3FilesChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new LambdaInvoke successfully', (done) => {
    const constructId = 'Get Data Product S3 Files';
    const construct = new GetDataProductS3FilesChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledWith(construct, constructId, {
      inputPath: '$.dataProductName',
      resultPath: '$',
      lambdaFunction: getDataProductS3FilesLambda,
      payloadResponseOnly: true
    });
    expect(addRetryMock).toHaveBeenCalledTimes(1);
    expect(addRetryMock).toHaveBeenCalledWith({ maxAttempts: 1 });
    expect(addCatchMock).toHaveBeenCalledTimes(1);
    expect(addCatchMock).toHaveBeenCalledWith(failedChain, { resultPath: '$.error' });

    done();
  });

  it('Should create a new EvaluateExpression for s3Uri successfully', (done) => {
    const constructId = 'Get Bucket S3 URI';
    const construct = new GetDataProductS3FilesChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(EvaluateExpression).toHaveBeenCalledTimes(2);
    expect(EvaluateExpression).toHaveBeenNthCalledWith(1, construct, constructId, {
      // eslint-disable-next-line no-template-curly-in-string
      expression: '`s3://${ $.dataProductProducerInfoObject.bucket-name }`',
      resultPath: '$.bucketS3Uri'
    });

    done();
  });

  it('Should create a new EvaluateExpression for s3Arn successfully', (done) => {
    const constructId = 'Get Bucket S3 ARN';
    const construct = new GetDataProductS3FilesChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(EvaluateExpression).toHaveBeenCalledTimes(2);
    expect(EvaluateExpression).toHaveBeenNthCalledWith(2, construct, constructId, {
      // eslint-disable-next-line no-template-curly-in-string
      expression: '`arn:aws:s3:::${ $.dataProductProducerInfoObject.bucket-name }`',
      resultPath: '$.bucketS3Arn'
    });

    done();
  });

  it('Should create a new GetDataProductS3FilesChain successfully', (done) => {
    new GetDataProductS3FilesChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(lambdaInvokeMock);
    expect(firstNextMock).toHaveBeenCalledTimes(1);
    expect(firstNextMock).toHaveBeenCalledWith(getMockObject(EvaluateExpression).mock.instances[0]);
    expect(secondNextMock).toHaveBeenCalledTimes(1);
    expect(secondNextMock).toHaveBeenCalledWith(getMockObject(EvaluateExpression).mock.instances[1]);
    expect(thirdNextMock).toHaveBeenCalledTimes(1);
    expect(thirdNextMock).toHaveBeenCalledWith(successChain);

    done();
  });
});
