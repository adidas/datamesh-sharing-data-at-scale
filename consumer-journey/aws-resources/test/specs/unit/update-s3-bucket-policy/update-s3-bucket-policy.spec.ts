import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { UpdateS3BucketPolicyChain } from '../../../../cdk/lib/update-s3-bucket-policy/chain';
import { UpdateS3BucketPolicy } from '../../../../cdk/lib/update-s3-bucket-policy/update-s3-bucket-policy';
import { UpdateS3BucketPolicyLambda } from '../../../../cdk/lib/update-s3-bucket-policy/lambda';

const basicStackId = 'ConsumerJourney';
const deploymentEnvironment: any = 'dev';
const stackBaseName = 'adidas-Consumer-Journey';
const stackBaseProps = {
  deploymentEnvironment,
  stackBaseName
};
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const updateS3BucketPolicyLambda = 'UpdateS3BucketPolicyLambda';

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/update-s3-bucket-policy/chain', () => ({
  UpdateS3BucketPolicyChain: jest.fn()
}));
jest.mock('../../../../cdk/lib/update-s3-bucket-policy/lambda', () => ({
  UpdateS3BucketPolicyLambda: jest.fn(() => ({ lambda: updateS3BucketPolicyLambda }))
}));

describe('# UpdateS3BucketPolicy', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new UpdateS3BucketPolicy(mockedStack, basicStackId, stackBaseProps);

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a UpdateS3BucketPolicyLambda construct', (done) => {
    const constructId = 'UpdateS3BucketPolicyLambda';
    const construct = new UpdateS3BucketPolicy(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(UpdateS3BucketPolicyLambda).toHaveBeenCalledTimes(1);
    expect(UpdateS3BucketPolicyLambda).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a UpdateS3BucketPolicyChain construct', (done) => {
    const constructId = 'UpdateS3BucketPolicyChain';
    const construct = new UpdateS3BucketPolicy(mockedStack, basicStackId, stackBaseProps);

    const newChain = construct.setupChain(successChain);

    expect(UpdateS3BucketPolicyChain).toHaveBeenCalledTimes(1);
    expect(UpdateS3BucketPolicyChain).toHaveBeenCalledWith(construct, constructId, {
      successChain, updateS3BucketPolicyLambda
    });
    expect(newChain).toEqual(getMockObject(UpdateS3BucketPolicyChain).mock.instances[0]);

    done();
  });
});
