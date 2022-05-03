import { AwsSts, Logger } from '@adidas-data-mesh/common';
import { AwsLakeFormation } from './data/aws-lake-formation';

type DomainConfig = {
  readonly awsSts: AwsSts;
  readonly lakeRoleSessionName: string;
  readonly accountId: string;
  readonly awsLakeFormation: AwsLakeFormation;
  readonly logger: Logger;
};

export class Domain {
  private readonly awsSts: AwsSts;
  private readonly lakeRoleSessionName: string;
  private readonly accountId: string;
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

  public async execute(dataProductLFTagName: string, producerAccountId: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', dataProductLFTagName, producerAccountId);

      const newCredentials = await this.awsSts.getRoleCredentials(this.lakeRoleSessionName, this.accountId);

      this.awsLakeFormation.withNewCredentials(newCredentials);

      await this.awsLakeFormation.grantDatabasePermissions(dataProductLFTagName, producerAccountId);
      await this.awsLakeFormation.grantTablePermissions(dataProductLFTagName, producerAccountId);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
