import { AwsSts, Logger } from '@adidas-data-mesh/common';
import { AwsLakeFormation } from './data/aws-lake-formation';
import { DataProductLFTagValues } from './lf-tags.model';

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

  public async execute(dataProductName: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', dataProductName);

      const newCredentials = await this.awsSts.getRoleCredentials(this.lakeRoleSessionName, this.accountId);

      this.awsLakeFormation.withNewCredentials(newCredentials);

      const dataProductLFTagValues = Object.values(DataProductLFTagValues);
      const dataProductTag = {
        TagKey: dataProductName,
        TagValues: dataProductLFTagValues
      };

      await this.awsLakeFormation.createDataProductTag(dataProductTag);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
