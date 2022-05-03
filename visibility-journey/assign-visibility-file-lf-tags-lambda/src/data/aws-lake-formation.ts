import { Credentials, LakeFormation } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';

export type Visibility = 'internal' | 'public' | 'confidential';

export type AddVisibilityLFTagToTableConfig = {
  databaseName: string;
  tableName: string;
  visibility: Visibility;
};

export type AddLFTagsToTableColumnsConfig = {
  databaseName: string;
  tableName: string;
  columnName: string;
  columnTagKey: 'pci' | 'pii';
  columnTagValue: boolean;
};

export class AwsLakeFormation {
  private lakeFormation: LakeFormation;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsLakeFormation';

  public constructor(lakeFormation: LakeFormation, logger: Logger) {
    this.lakeFormation = lakeFormation;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async addVisibilityLFTagToTable({
    databaseName, tableName, visibility
  }: AddVisibilityLFTagToTableConfig): Promise<void> {
    try {
      this.logger.info('Starting addVisibilityLFTagToTable');
      this.logger.debug('Initial Input', databaseName, tableName, visibility);

      await this.lakeFormation.addLFTagsToResource({
        LFTags: [
          {
            TagKey: 'visibility',
            TagValues: [ visibility ]
          }
        ],
        Resource: {
          Table: {
            DatabaseName: databaseName,
            Name: tableName
          }
        }
      }).promise();

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async addLFTagsToTableColumns({
    databaseName, tableName, columnName, columnTagKey, columnTagValue
  }: AddLFTagsToTableColumnsConfig): Promise<void> {
    try {
      this.logger.info('Starting addLFTagsToTableColumns');
      this.logger.debug('Initial Input', databaseName, tableName, columnName, columnTagKey, columnTagValue);

      await this.lakeFormation.addLFTagsToResource({
        LFTags: [
          {
            TagKey: columnTagKey,
            TagValues: [ `${ columnTagValue }` ]
          }
        ],
        Resource: {
          TableWithColumns: {
            DatabaseName: databaseName,
            Name: tableName,
            ColumnNames: [ columnName ]
          }
        }
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
