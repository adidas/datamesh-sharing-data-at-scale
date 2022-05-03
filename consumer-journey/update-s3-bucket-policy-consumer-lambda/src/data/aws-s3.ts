import { AWSError, S3, Credentials } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';
import { S3Policy, S3PolicyEffect } from '../s3-policy.model';

export class AwsS3 {
  private s3: S3;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsS3';
  private readonly iamSIDPolicyName = 'AllowAccessFromIamConsumers';

  public constructor(s3: S3, logger: Logger) {
    this.s3 = s3;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async getS3BucketResourcePolicy(bucketName: string): Promise<S3Policy> {
    try {
      this.logger.info('getS3BucketResourcePolicy Starting');

      const result = await this.s3.getBucketPolicy({
        Bucket: bucketName
      }).promise();

      if (!result.Policy) {
        const errorMessage = 'No policy has been found';

        this.logger.info(errorMessage);

        throw new Error(errorMessage);
      }

      const s3Policy = JSON.parse(result.Policy) as S3Policy;

      this.logger.debug('Current S3 Policy', s3Policy);

      const s3CatalogPolicy = s3Policy.Statement.some(({ Sid }) => Sid === this.iamSIDPolicyName)
        ? s3Policy : {
          ...s3Policy,
          Statement: [
            ...s3Policy.Statement,
            this.buildDefaultS3CatalogStatement(bucketName)
          ]
        };

      this.logger.info('Finishing...', s3CatalogPolicy);

      return s3CatalogPolicy;
    } catch (error) {
      this.logger.error(error);
      const noPolicyFound = 'NoSuchBucketPolicy';

      if ((error as AWSError).code === noPolicyFound) {
        // eslint-disable-next-line no-undefined
        return this.buildDefaultS3Policy(bucketName);
      }

      throw error;
    }
  }

  public async setS3Policy(bucketName: string, s3Policy: S3Policy): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('SetS3Policy Input', s3Policy);

      await this.s3.putBucketPolicy({
        Bucket: bucketName,
        Policy: JSON.stringify(s3Policy)
      }).promise();

      this.logger.info('Finishing...');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public withNewCredentials(credentials: Credentials): void {
    this.s3 = new S3({ credentials });
  }

  private buildDefaultS3Policy(bucketName: string): S3Policy {
    return {
      Version: '2012-10-17',
      Statement: [ this.buildDefaultS3CatalogStatement(bucketName) ]
    };
  }

  private buildDefaultS3CatalogStatement(bucketName: string) {
    return {
      Sid: this.iamSIDPolicyName,
      Effect: S3PolicyEffect.allow,
      Action: [
        's3:ListBucket',
        's3:GetObject'
      ],
      Resource: [
        `arn:aws:s3:::${ bucketName }`,
        `arn:aws:s3:::${ bucketName }/*`
      ],
      Principal: {
        AWS: []
      }
    };
  }
}
