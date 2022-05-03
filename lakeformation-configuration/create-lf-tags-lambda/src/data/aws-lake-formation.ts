import { Credentials, LakeFormation } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';

export type LakeFormationTag = {
  readonly TagKey: string;
  readonly TagValues: Array<string>;
};

export class AwsLakeFormation {
  private lakeFormation: LakeFormation;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsLakeFormation';

  public constructor(lakeFormation: LakeFormation, logger: Logger) {
    this.lakeFormation = lakeFormation;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async deleteLFTag(lfTagKey: string): Promise<void> {
    try {
      this.logger.info('Starting deleteLFTag');
      this.logger.debug('Initial Input', lfTagKey);

      await this.lakeFormation.deleteLFTag({
        TagKey: lfTagKey
      }).promise();

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async createLFTag(lakeFormationTag: LakeFormationTag): Promise<void> {
    try {
      this.logger.info('Starting createLFTag');
      this.logger.debug('Initial Input', lakeFormationTag);

      await this.lakeFormation.createLFTag(lakeFormationTag).promise();

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async updateLFTag(
      lfTagKey: string, tagValuesToDelete: Array<string>, tagValuesToAdd: Array<string>
  ): Promise<void> {
    try {
      this.logger.info('Starting updateLFTag');
      this.logger.debug('Initial Input', lfTagKey);

      await this.lakeFormation.updateLFTag({
        TagKey: lfTagKey,
        TagValuesToAdd: tagValuesToAdd,
        TagValuesToDelete: tagValuesToDelete
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
