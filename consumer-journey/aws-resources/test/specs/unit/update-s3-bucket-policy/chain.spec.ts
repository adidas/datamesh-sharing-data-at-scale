import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import {
  UpdateS3BucketPolicyChain, UpdateS3BucketPolicyChainProps
} from '../../../../cdk/lib/update-s3-bucket-policy/chain';

const basicStackId = 'UpdateS3BucketPolicyChain';
const successChain: any = jest.fn();
const updateS3BucketPolicyLambda: any = 'UpdateS3BucketPolicyLambda';
const stackBaseProps: UpdateS3BucketPolicyChainProps = {
  updateS3BucketPolicyLambda,
  successChain
};
const mockedStack: any = jest.fn();
const nextMock = jest.fn();
const lambdaInvokeMock = jest.fn();
const addRetryMock = jest.fn().mockReturnValue(lambdaInvokeMock);

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  Chain: { start: jest.fn(() => ({ next: nextMock })) },
  JsonPath: { DISCARD: 'JsonPathDISCARD' }
}));
jest.mock('@aws-cdk/aws-stepfunctions-tasks', () => ({
  LambdaInvoke: jest.fn(() => ({ addRetry: addRetryMock }))
}));

describe('# UpdateS3BucketPolicyChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new LambdaInvoke successfully', (done) => {
    const constructId = 'Update S3 Bucket Policy';
    const construct = new UpdateS3BucketPolicyChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledWith(construct, constructId, {
      inputPath: '$',
      resultPath: 'JsonPathDISCARD',
      lambdaFunction: updateS3BucketPolicyLambda,
      payloadResponseOnly: true
    });

    done();
  });

  it('Should create a new UpdateS3BucketPolicyChain successfully', (done) => {
    new UpdateS3BucketPolicyChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(lambdaInvokeMock);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(successChain);

    done();
  });
});
