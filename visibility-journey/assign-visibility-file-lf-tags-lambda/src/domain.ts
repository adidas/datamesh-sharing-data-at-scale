import { AwsSts, Logger } from '@adidas-data-mesh/common';
import { AwsLakeFormation } from './data/aws-lake-formation';

export type Visibility = 'internal' | 'public' | 'confidential';

export type DataProductVisibilityColumns = {
  readonly name: string;
  readonly pii?: boolean;
  readonly pci?: boolean;
};

export type DataProductVisibilityObject = {
  readonly tables: Array<{
    readonly name: string;
    readonly visibility: Visibility;
    readonly columns?: Array<DataProductVisibilityColumns>;
  }>;
};

export type DomainInput = {
  readonly dataProductVisibilityObject: DataProductVisibilityObject;
  readonly glueDatabaseName: string;
};

type DomainConfig = {
  readonly awsLakeFormation: AwsLakeFormation;
  readonly awsSts: AwsSts;
  readonly lakeRoleSessionName: string;
  readonly accountId: string;
  readonly logger: Logger;
};

export class Domain {
  private readonly awsSts: AwsSts;
  private readonly lakeRoleSessionName: string;
  private readonly accountId: string;
  private readonly awsLakeFormation: AwsLakeFormation;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';

  public constructor({ awsLakeFormation, awsSts, lakeRoleSessionName, accountId, logger }: DomainConfig) {
    this.awsLakeFormation = awsLakeFormation;
    this.awsSts = awsSts;
    this.lakeRoleSessionName = lakeRoleSessionName;
    this.accountId = accountId;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(input: DomainInput): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', input);

      const { dataProductVisibilityObject, glueDatabaseName } = input;

      const newCredentials = await this.awsSts.getRoleCredentials(this.lakeRoleSessionName, this.accountId);

      this.awsLakeFormation.withNewCredentials(newCredentials);

      await this.addVisibilityLFTagToTable(dataProductVisibilityObject, glueDatabaseName);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  private async addVisibilityLFTagToTable(
      dataProductVisibilityObject: DataProductVisibilityObject, glueDatabaseName: string
  ) {
    await dataProductVisibilityObject.tables.reduce(async (previousPromise, {
      name: tableName, visibility, columns
    }) => {
      await previousPromise;

      this.logger.debug('Adding LF Tags to table:', tableName);
      await this.awsLakeFormation.addVisibilityLFTagToTable({
        databaseName: glueDatabaseName,
        tableName,
        visibility
      });

      return this.addLFTagsToTableColumns(tableName, glueDatabaseName, columns);
    }, Promise.resolve());
  }

  private addLFTagsToTableColumns(
      tableName: string, glueDatabaseName: string, columns?: Array<DataProductVisibilityColumns>
  ) {
    return columns?.reduce(async (previousPromise, columnInfo) => {
      await previousPromise;
      this.logger.debug('Adding LF Tags to table columns:', columnInfo.name);

      return this.awsLakeFormation.addLFTagsToTableColumns({
        databaseName: glueDatabaseName,
        tableName,
        columnName: columnInfo.name,
        columnTagKey: columnInfo.pci ? 'pci' : 'pii',
        columnTagValue: columnInfo.pci ?? columnInfo.pii ?? false
      });
    }, Promise.resolve());
  }
}
