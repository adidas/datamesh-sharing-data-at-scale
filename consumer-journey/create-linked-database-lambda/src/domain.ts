import { Logger, AwsSts } from '@adidas-data-mesh/common';
import { AwsGlue } from './data/aws-glue';

type DomainConfig = {
  readonly awsSts: AwsSts;
  readonly awsGlue: AwsGlue;
  readonly logger: Logger;
};

export class Domain {
  private readonly awsSts: AwsSts;
  private readonly awsGlue: AwsGlue;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';

  public constructor({ awsSts, awsGlue, logger }: DomainConfig) {
    this.awsSts = awsSts;
    this.awsGlue = awsGlue;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(glueDatabaseName: string, consumerRoleArn: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', glueDatabaseName, consumerRoleArn);

      const { roleName, accountId } = this.getRoleNameAndAccountId(consumerRoleArn);

      const newCredentials = await this.awsSts.getRoleCredentials(roleName, accountId);

      this.awsGlue.withNewCredentials(newCredentials);

      await this.awsGlue.createLinkedDatabase(glueDatabaseName);

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
