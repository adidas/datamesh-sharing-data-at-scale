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

  public async disableIamControlAccess(glueDatabaseName: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', glueDatabaseName);

      await this.lakeFormation.revokePermissions({
        Principal: {
          DataLakePrincipalIdentifier: 'IAM_ALLOWED_PRINCIPALS'
        },
        Resource: {
          Database: {
            Name: glueDatabaseName
          }
        },
        Permissions: [ 'ALL' ]
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
