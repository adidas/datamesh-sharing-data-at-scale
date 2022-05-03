import { Credentials, LakeFormation } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';

export class AwsLakeFormation {
  private lakeFormation: LakeFormation;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsLakeFormation';

  public constructor(lakeFormation: LakeFormation, logger: Logger) {
    this.lakeFormation = lakeFormation;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async grantDatabasePermissions(databaseName: string, consumerRoleArn: string): Promise<void> {
    try {
      this.logger.info('Starting grantDatabasePermissions');
      this.logger.debug('Initial Input', databaseName, consumerRoleArn);

      const listOfPermissions = [ 'DESCRIBE' ];

      await this.lakeFormation.grantPermissions({
        Principal: {
          DataLakePrincipalIdentifier: consumerRoleArn
        },
        Resource: {
          Database: {
            Name: databaseName
          }
        },
        Permissions: listOfPermissions
      }).promise();

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async grantTablePermissions(databaseName: string, consumerRoleArn: string): Promise<void> {
    try {
      this.logger.info('Starting grantTablePermissions');
      this.logger.debug('Initial Input', databaseName, consumerRoleArn);

      const listOfPermissions = [ 'DESCRIBE', 'SELECT' ];

      await this.lakeFormation.grantPermissions({
        Principal: {
          DataLakePrincipalIdentifier: consumerRoleArn
        },
        Resource: {
          Table: {
            DatabaseName: databaseName,
            TableWildcard: {}
          }
        },
        Permissions: listOfPermissions
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
