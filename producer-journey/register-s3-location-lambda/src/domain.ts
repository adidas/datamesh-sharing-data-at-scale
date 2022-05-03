import { AwsSts, Logger } from '@adidas-data-mesh/common';
import { AwsLakeFormation } from './data/aws-lake-formation';

type DomainConfig = {
  readonly awsSts: AwsSts;
  readonly awsLakeFormation: AwsLakeFormation;
  readonly logger: Logger;
  readonly lakeRoleSessionName: string;
  readonly accountId: string;
};

export class Domain {
  private readonly lakeRoleSessionName: string;
  private readonly accountId: string;
  private readonly awsSts: AwsSts;
  private readonly awsLakeFormation: AwsLakeFormation;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';

  public constructor({ awsSts, awsLakeFormation, lakeRoleSessionName, accountId, logger }: DomainConfig) {
    this.awsSts = awsSts;
    this.lakeRoleSessionName = lakeRoleSessionName;
    this.accountId = accountId;
    this.awsLakeFormation = awsLakeFormation;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(s3LocationArn: string, producerAccountId: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', s3LocationArn, producerAccountId);

      const newCredentials = await this.awsSts.getRoleCredentials(this.lakeRoleSessionName, this.accountId);

      const roleArn = `arn:aws:iam::${ this.accountId }:role/${ this.lakeRoleSessionName }`;

      await this.awsLakeFormation.registerResource(s3LocationArn, roleArn);

      this.awsLakeFormation.withNewCredentials(newCredentials);

      await this.awsLakeFormation.grantLocationAccess(s3LocationArn, roleArn);
      await this.awsLakeFormation.grantLocationAccess(s3LocationArn, producerAccountId);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
