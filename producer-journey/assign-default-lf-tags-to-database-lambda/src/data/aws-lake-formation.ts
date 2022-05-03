import { Credentials, LakeFormation } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';
import { LakeFormationTag } from '../lf-tags.model';

export class AwsLakeFormation {
  private lakeFormation: LakeFormation;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsLakeFormation';

  public constructor(lakeFormation: LakeFormation, logger: Logger) {
    this.lakeFormation = lakeFormation;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async addLFTagsToResource(databaseName: string, defaultLFTags: Array<LakeFormationTag>): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', databaseName, defaultLFTags);

      await this.lakeFormation.addLFTagsToResource({
        Resource: {
          Database: {
            Name: databaseName
          }
        },
        LFTags: defaultLFTags
      }).promise();

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public withNewCredentials(credentials: Credentials): void {
    this.lakeFormation = new LakeFormation({ credentials });
  }
}
