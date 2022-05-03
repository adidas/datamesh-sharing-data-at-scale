import { Credentials, LakeFormation } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';
import {
  CommonLFTagKeys, DataProductLFTagValues, PciLFTagValues,
  PiiLFTagValues
} from '../lf-tags.model';

export class AwsLakeFormation {
  private lakeFormation: LakeFormation;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsLakeFormation';

  public constructor(lakeFormation: LakeFormation, logger: Logger) {
    this.lakeFormation = lakeFormation;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async grantDatabasePermissions(dataProductLFTagName: string, consumerAccountId: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', dataProductLFTagName, consumerAccountId);

      const listOfPermissions = [ 'DESCRIBE' ];

      await this.lakeFormation.grantPermissions({
        Principal: {
          DataLakePrincipalIdentifier: consumerAccountId
        },
        Resource: {
          LFTagPolicy: {
            ResourceType: 'DATABASE',
            Expression: [
              {
                TagKey: dataProductLFTagName,
                TagValues: [ DataProductLFTagValues.access ]
              },
              {
                TagKey: CommonLFTagKeys.pci,
                TagValues: [ PciLFTagValues.false ]
              },
              {
                TagKey: CommonLFTagKeys.pii,
                TagValues: [ PiiLFTagValues.false ]
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

  public async grantTablePermissions(dataProductLFTagName: string, consumerAccountId: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', dataProductLFTagName, consumerAccountId);

      const listOfPermissions = [ 'DESCRIBE', 'SELECT' ];

      await this.lakeFormation.grantPermissions({
        Principal: {
          DataLakePrincipalIdentifier: consumerAccountId
        },
        Resource: {
          LFTagPolicy: {
            ResourceType: 'TABLE',
            Expression: [
              {
                TagKey: dataProductLFTagName,
                TagValues: [ DataProductLFTagValues.access ]
              },
              {
                TagKey: CommonLFTagKeys.pci,
                TagValues: [ PciLFTagValues.false ]
              },
              {
                TagKey: CommonLFTagKeys.pii,
                TagValues: [ PiiLFTagValues.false ]
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
