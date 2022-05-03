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

  public async registerResource(s3LocationArn: string, roleArn: string): Promise<void> {
    try {
      this.logger.info('Starting registerResource');
      this.logger.debug('Initial Input', s3LocationArn, roleArn);

      await this.lakeFormation.registerResource({
        ResourceArn: s3LocationArn,
        RoleArn: roleArn
      }).promise();

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async grantLocationAccess(s3LocationArn: string, dataLakePrincipalIdentifier: string): Promise<void> {
    try {
      this.logger.info('Starting grantLocationAccess');
      this.logger.debug('Initial Input', s3LocationArn, dataLakePrincipalIdentifier);

      await this.lakeFormation.grantPermissions({
        Principal: {
          DataLakePrincipalIdentifier: dataLakePrincipalIdentifier
        },
        Resource: {
          DataLocation: {
            ResourceArn: s3LocationArn
          }
        },
        Permissions: [ 'DATA_LOCATION_ACCESS' ]
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
