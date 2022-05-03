import { Logger, AwsSts } from '@adidas-data-mesh/common';
import { AwsLakeFormation } from './data/aws-lake-formation';
import {
  DataProductLFTagValues, pciLFTag, PciLFTagValues, piiLFTag, PiiLFTagValues, visibilityLFTag, VisibilityLFTagValues
} from './lf-tags.model';

type DomainConfig = {
  readonly awsSts: AwsSts;
  readonly lakeRoleSessionName: string;
  readonly accountId: string;
  readonly awsLakeFormation: AwsLakeFormation;
  readonly logger: Logger;
};

export class Domain {
  private readonly awsSts: AwsSts;
  private readonly awsLakeFormation: AwsLakeFormation;
  private readonly lakeRoleSessionName: string;
  private readonly accountId: string;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';

  public constructor({ awsSts, awsLakeFormation, lakeRoleSessionName, accountId, logger }: DomainConfig) {
    this.awsSts = awsSts;
    this.lakeRoleSessionName = lakeRoleSessionName;
    this.accountId = accountId;
    this.awsLakeFormation = awsLakeFormation;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(databaseName: string, dataProductName: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', databaseName, dataProductName);

      const newCredentials = await this.awsSts.getRoleCredentials(this.lakeRoleSessionName, this.accountId);

      this.awsLakeFormation.withNewCredentials(newCredentials);

      const defaultLFTags = [
        {
          TagKey: dataProductName,
          TagValues: [ DataProductLFTagValues.access ]
        },
        {
          TagKey: visibilityLFTag.TagKey,
          TagValues: [ VisibilityLFTagValues.public ]
        },
        {
          TagKey: pciLFTag.TagKey,
          TagValues: [ PciLFTagValues.false ]
        },
        {
          TagKey: piiLFTag.TagKey,
          TagValues: [ PiiLFTagValues.false ]
        }
      ];

      await this.awsLakeFormation.addLFTagsToResource(databaseName, defaultLFTags);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
