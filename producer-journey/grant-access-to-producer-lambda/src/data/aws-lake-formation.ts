import { Credentials, LakeFormation } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';
import { DataProductLFTagValues } from '../lf-tags.model';

export class AwsLakeFormation {
  private lakeFormation: LakeFormation;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsLakeFormation';

  public constructor(lakeFormation: LakeFormation, logger: Logger) {
    this.lakeFormation = lakeFormation;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async grantDatabasePermissions(dataProductLFTagName: string, producerAccountId: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', dataProductLFTagName, producerAccountId);

      const listOfPermissions = [ 'CREATE_TABLE' ];

      await this.lakeFormation.grantPermissions({
        Principal: {
          DataLakePrincipalIdentifier: producerAccountId
        },
        Resource: {
          LFTagPolicy: {
            ResourceType: 'DATABASE',
            Expression: [
              {
                TagKey: dataProductLFTagName,
                TagValues: [ DataProductLFTagValues.access ]
              }
            ]
          }
        },
        Permissions: listOfPermissions,
        PermissionsWithGrantOption: listOfPermissions
      }).promise();

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async grantTablePermissions(dataProductLFTagName: string, producerAccountId: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', dataProductLFTagName, producerAccountId);

      const listOfPermissions = [ 'SELECT', 'ALTER', 'DELETE', 'INSERT', 'DESCRIBE' ];

      await this.lakeFormation.grantPermissions({
        Principal: {
          DataLakePrincipalIdentifier: producerAccountId
        },
        Resource: {
          LFTagPolicy: {
            ResourceType: 'TABLE',
            Expression: [
              {
                TagKey: dataProductLFTagName,
                TagValues: [ DataProductLFTagValues.access ]
              }
            ]
          }
        },
        Permissions: listOfPermissions,
        PermissionsWithGrantOption: listOfPermissions
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
