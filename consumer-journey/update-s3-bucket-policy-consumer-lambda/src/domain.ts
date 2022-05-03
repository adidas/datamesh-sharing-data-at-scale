import { Logger, AwsSts } from '@adidas-data-mesh/common';
import { AwsS3 } from './data/aws-s3';

type DomainConfig = {
  readonly awsS3: AwsS3;
  readonly awsSts: AwsSts;
  readonly logger: Logger;
};

export class Domain {
  private readonly awsS3: AwsS3;
  private readonly awsSts: AwsSts;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';
  private readonly iamSIDPolicyName = 'AllowAccessFromIamConsumers';

  public constructor({ awsS3, awsSts, logger }: DomainConfig) {
    this.awsS3 = awsS3;
    this.awsSts = awsSts;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(bucketName: string, producerRoleArn: string, consumerAccountId: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', bucketName, producerRoleArn, consumerAccountId);

      const { accountId, roleName } = this.getRoleNameAndAccountId(producerRoleArn);

      const newCredentials = await this.awsSts.getRoleCredentials(roleName, accountId);

      this.awsS3.withNewCredentials(newCredentials);

      const currentS3BucketResourcePolicy = await this.awsS3.getS3BucketResourcePolicy(bucketName);

      this.logger.debug('Current S3 Bucket Resource Policy', currentS3BucketResourcePolicy);

      const s3CatalogStatement = currentS3BucketResourcePolicy.Statement.find(({ Sid }) =>
        Sid === this.iamSIDPolicyName);
      const awsPrincipal = s3CatalogStatement?.Principal.AWS ?? '';
      const setAccountsArn = new Set(
        Array.isArray(awsPrincipal) ? awsPrincipal : [ awsPrincipal ]
      ).add(consumerAccountId);
      const accountsArn = [ ...setAccountsArn ];
      const newS3CatalogStatement = {
        ...s3CatalogStatement,
        Principal: {
          AWS: accountsArn
        }
      };

      this.logger.debug('New S3 Catalog Statement', newS3CatalogStatement);

      const newS3CatalogPolicy = {
        ...currentS3BucketResourcePolicy,
        Statement: currentS3BucketResourcePolicy.Statement.map((s3Statement) =>
          s3Statement.Sid === this.iamSIDPolicyName ? newS3CatalogStatement : s3Statement)
      };

      this.logger.debug('New S3 Catalog Policy', newS3CatalogPolicy);

      await this.awsS3.setS3Policy(bucketName, newS3CatalogPolicy);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  private getRoleNameAndAccountId(roleArn: string) {
    /* eslint-disable prefer-destructuring */
    const [ , , , , accountId ] = roleArn.split(':');
    const [ , roleName ] = roleArn.split('/');

    return {
      accountId,
      roleName
    };
  }
}
