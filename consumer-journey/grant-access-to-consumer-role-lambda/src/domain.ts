import { Logger, AwsSts } from '@adidas-data-mesh/common';
import { AwsLakeFormation } from './data/aws-lake-formation';

type DomainConfig = {
  readonly awsSts: AwsSts;
  readonly awsLakeFormation: AwsLakeFormation;
  readonly logger: Logger;
};

export class Domain {
  private readonly awsSts: AwsSts;
  private readonly awsLakeFormation: AwsLakeFormation;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';

  public constructor({ awsSts, awsLakeFormation, logger }: DomainConfig) {
    this.awsSts = awsSts;
    this.awsLakeFormation = awsLakeFormation;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(databaseName: string, consumerRoleArn: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', databaseName, consumerRoleArn);

      const { roleName, accountId } = this.getRoleNameAndAccountId(consumerRoleArn);

      const newCredentials = await this.awsSts.getRoleCredentials(roleName, accountId);

      this.awsLakeFormation.withNewCredentials(newCredentials);

      await this.awsLakeFormation.grantDatabasePermissions(databaseName, consumerRoleArn);
      await this.awsLakeFormation.grantTablePermissions(databaseName, consumerRoleArn);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  private getRoleNameAndAccountId(roleArn: string) {
    /* eslint-disable prefer-destructuring */
    const [ , , , , accountId ] = roleArn.split(':');
    const [ , roleName ] = roleArn.split('/');

    return {
      accountId,
      roleName
    };
  }
}
