import { Logger } from '@adidas-data-mesh/common';
import { S3 } from 'aws-sdk';
import { AwsS3 } from '../../../../src/data/aws-s3';
import { S3PolicyStatement, S3PolicyEffect, S3Policy } from '../../../../src/s3-policy.model';

const logger = Logger.silent();

const lakeformationSIDPolicyName = 'AllowAccessFromLakeFormationCentral';
const bucketName = 'bucketName';
const s3CatalogPolicyStatement: S3PolicyStatement = {
  Sid: lakeformationSIDPolicyName,
  Effect: S3PolicyEffect.allow,
  Action: [
    's3:ListBucket',
    's3:DeleteObject',
    's3:GetObject',
    's3:PutObject'
  ],
  Resource: [
    `arn:aws:s3:::${ bucketName }`,
    `arn:aws:s3:::${ bucketName }/*`
  ],
  Principal: {
    AWS: [ ]
  }
};
const s3SparePolicyStatement: S3PolicyStatement = {
  Sid: 'foobar',
  Effect: S3PolicyEffect.allow,
  Action: 's3:*',
  Resource: [ '*' ],
  Principal: { AWS: [ ] }
};
const s3Policy: S3Policy = {
  Version: '2012-10-17',
  Statement: [ s3SparePolicyStatement, s3CatalogPolicyStatement ]
};
const getResourcePolicyResponse = {
  Policy: JSON.stringify(s3Policy)
};
const s3: any = {};
const getBucketPolicyMock = jest.fn(async () => Promise.resolve(getResourcePolicyResponse));
const putBucketPolicyMock = jest.fn(async () => Promise.resolve());

jest.mock('aws-sdk', () => ({ S3: jest.fn() }));

describe('# AwsS3', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    s3.getBucketPolicy = jest.fn(() => ({ promise: getBucketPolicyMock }));
    s3.putBucketPolicy = jest.fn(() => ({ promise: putBucketPolicyMock }));
  });

  describe('getS3CatalogPolicy()', () => {
    it('Should getS3CatalogPolicy successfully', async () => {
      const awsS3 = new AwsS3(s3, logger);

      const response = await awsS3.getS3BucketResourcePolicy(bucketName);

      expect(getBucketPolicyMock).toHaveBeenCalledTimes(1);
      expect(s3.getBucketPolicy).toHaveBeenCalledTimes(1);
      expect(s3.getBucketPolicy).toHaveBeenCalledWith({
        Bucket: bucketName
      });
      expect(response).toEqual(s3Policy);
    });

    it('Should getS3CatalogPolicy successfully when there is no AllowAccessFromLakeFormationCentral statement', async () => {
      const awsS3 = new AwsS3(s3, logger);
      const newS3Policy: S3Policy = {
        Version: '2012-10-17',
        Statement: [ s3SparePolicyStatement ]
      };
      const newGetResourcePolicyResponse = {
        Policy: JSON.stringify(newS3Policy)
      };

      getBucketPolicyMock.mockResolvedValue(newGetResourcePolicyResponse);

      const response = await awsS3.getS3BucketResourcePolicy(bucketName);

      expect(getBucketPolicyMock).toHaveBeenCalledTimes(1);
      expect(s3.getBucketPolicy).toHaveBeenCalledTimes(1);
      expect(s3.getBucketPolicy).toHaveBeenCalledWith({
        Bucket: bucketName
      });
      expect(response).toEqual(s3Policy);
    });

    it('Should getS3CatalogPolicy successfully when there is no s3 policy yet', async () => {
      const awsS3 = new AwsS3(s3, logger);
      const noPolicyFound = 'NoSuchBucketPolicy';
      const awsError = {
        code: noPolicyFound
      };

      getBucketPolicyMock.mockRejectedValue(awsError);

      const response = await awsS3.getS3BucketResourcePolicy(bucketName);

      expect(getBucketPolicyMock).toHaveBeenCalledTimes(1);
      expect(s3.getBucketPolicy).toHaveBeenCalledTimes(1);
      expect(s3.getBucketPolicy).toHaveBeenCalledWith({
        Bucket: bucketName
      });
      expect(response).toEqual({
        Version: '2012-10-17',
        Statement: [ s3CatalogPolicyStatement ]
      });
    });

    it('Should throw an error since no Policy has been found', async () => {
      const awsS3 = new AwsS3(s3, logger);
      const newGetResourcePolicyResponse = {};
      const errorMessage = 'No policy has been found';
      const unexpectedError = new Error(errorMessage);

      getBucketPolicyMock.mockResolvedValue(newGetResourcePolicyResponse as any);

      await expect(async () => awsS3.getS3BucketResourcePolicy(bucketName))
          .rejects.toThrow(unexpectedError);
      expect(getBucketPolicyMock).toHaveBeenCalledTimes(1);
      expect(s3.getBucketPolicy).toHaveBeenCalledTimes(1);
      expect(s3.getBucketPolicy).toHaveBeenCalledWith({
        Bucket: bucketName
      });
    });
  });

  describe('setS3Policy()', () => {
    it('Should setS3Policy successfully', async () => {
      const awsS3 = new AwsS3(s3, logger);

      await awsS3.setS3Policy(bucketName, s3Policy);

      expect(putBucketPolicyMock).toHaveBeenCalledTimes(1);
      expect(s3.putBucketPolicy).toHaveBeenCalledTimes(1);
      expect(s3.putBucketPolicy).toHaveBeenCalledWith({
        Policy: JSON.stringify(s3Policy),
        Bucket: bucketName
      });
    });

    it('Should throw an error since aws service has failed', async () => {
      const awsS3 = new AwsS3(s3, logger);
      const unexpectedError = new Error('There has been an error');

      putBucketPolicyMock.mockRejectedValue(unexpectedError);

      await expect(async () => awsS3.setS3Policy(bucketName, s3Policy))
          .rejects.toThrow(unexpectedError);
      expect(putBucketPolicyMock).toHaveBeenCalledTimes(1);
      expect(s3.putBucketPolicy).toHaveBeenCalledTimes(1);
      expect(s3.putBucketPolicy).toHaveBeenCalledWith({
        Policy: JSON.stringify(s3Policy),
        Bucket: bucketName
      });
    });
  });

  describe('withNewCredentials()', () => {
    it('Should withNewCredentials successfully', (done) => {
      const awsS3 = new AwsS3(s3, logger);
      const newCredentials: any = {
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        sessionToken: 'sessionToken'
      };

      awsS3.withNewCredentials(newCredentials);

      expect(S3).toHaveBeenCalledTimes(1);
      expect(S3).toHaveBeenCalledWith({
        credentials: newCredentials
      });

      done();
    });
  });
});
