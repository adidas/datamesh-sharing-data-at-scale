import { AwsSts, Logger } from '@adidas-data-mesh/common';
import { AwsS3 } from './data/aws-s3';

type DomainConfig = {
  readonly awsS3: AwsS3;
  readonly lakeFormationAdminRoleName: string;
  readonly centralAccount: string;
  readonly awsSts: AwsSts;
  readonly logger: Logger;
};

export class Domain {
  private readonly awsS3: AwsS3;
  private readonly awsSts: AwsSts;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';
  private readonly lakeformationSIDPolicyName = 'AllowAccessFromLakeFormationCentral';
  private readonly lakeFormationAdminRoleName: string;
  private readonly centralAccount: string;

  public constructor({ awsS3, awsSts, lakeFormationAdminRoleName, centralAccount, logger }: DomainConfig) {
    this.awsS3 = awsS3;
    this.lakeFormationAdminRoleName = lakeFormationAdminRoleName;
    this.centralAccount = centralAccount;
    this.awsSts = awsSts;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(bucketName: string, producerRoleArn: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', bucketName, producerRoleArn);

      const { accountId, roleName } = this.getRoleNameAndAccountId(producerRoleArn);

      const newCredentials = await this.awsSts.getRoleCredentials(roleName, accountId);

      this.awsS3.withNewCredentials(newCredentials);

      const currentS3BucketResourcePolicy = await this.awsS3.getS3BucketResourcePolicy(bucketName);

      this.logger.debug('Current S3 Bucket Resource Policy', currentS3BucketResourcePolicy);

      const s3CatalogStatement = currentS3BucketResourcePolicy.Statement.find(({ Sid }) =>
        Sid === this.lakeformationSIDPolicyName);
      const newPrincipalAccount = this.buildAWSPrincipal(this.centralAccount, this.lakeFormationAdminRoleName);
      const awsPrincipal = s3CatalogStatement?.Principal.AWS ?? '';
      const setAccountsArn = new Set(
        Array.isArray(awsPrincipal) ? awsPrincipal : [ awsPrincipal ]
      ).add(newPrincipalAccount);
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
          s3Statement.Sid === this.lakeformationSIDPolicyName ? newS3CatalogStatement : s3Statement)
      };

      this.logger.debug('New S3 Catalog Policy', newS3CatalogPolicy);

      await this.awsS3.setS3Policy(bucketName, newS3CatalogPolicy);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  private buildAWSPrincipal(accountId: string, roleArn: string) {
    return `arn:aws:iam::${ accountId }:role/${ roleArn }`;
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
