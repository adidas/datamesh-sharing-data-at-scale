import { AwsSts, Logger } from '@adidas-data-mesh/common';
import { AwsGlue } from './data/aws-glue';
import { AwsLakeFormation } from './data/aws-lake-formation';

type DomainConfig = {
  readonly awsSts: AwsSts;
  readonly awsGlue: AwsGlue;
  readonly lakeRoleSessionName: string;
  readonly accountId: string;
  readonly awsLakeFormation: AwsLakeFormation;
  readonly logger: Logger;
};

export class Domain {
  private readonly awsSts: AwsSts;
  private readonly lakeRoleSessionName: string;
  private readonly accountId: string;
  private readonly awsGlue: AwsGlue;
  private readonly awsLakeFormation: AwsLakeFormation;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';

  public constructor({ awsSts, awsGlue, awsLakeFormation, lakeRoleSessionName, accountId, logger }: DomainConfig) {
    this.awsSts = awsSts;
    this.awsGlue = awsGlue;
    this.lakeRoleSessionName = lakeRoleSessionName;
    this.accountId = accountId;
    this.awsLakeFormation = awsLakeFormation;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(glueDatabaseName: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', glueDatabaseName);

      const newCredentials = await this.awsSts.getRoleCredentials(this.lakeRoleSessionName, this.accountId);

      this.awsGlue.withNewCredentials(newCredentials);
      this.awsLakeFormation.withNewCredentials(newCredentials);

      if (glueDatabaseName.includes('iam')) {
        await this.awsGlue.createIamDatabase(glueDatabaseName);
      } else if (glueDatabaseName.includes('lf')) {
        await this.awsGlue.createLFDatabase(glueDatabaseName);
        await this.awsLakeFormation.disableIamControlAccess(glueDatabaseName);
      }

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
