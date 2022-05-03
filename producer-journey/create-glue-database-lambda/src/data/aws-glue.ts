import { Credentials, Glue } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';

export class AwsGlue {
  private glue: Glue;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsGlue';

  public constructor(glue: Glue, logger: Logger) {
    this.glue = glue;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async createLFDatabase(glueDatabaseName: string): Promise<void> {
    try {
      this.logger.info('Starting createLFDatabase');
      this.logger.debug('Initial Input', glueDatabaseName);

      await this.glue.createDatabase({
        DatabaseInput: {
          Name: glueDatabaseName,
          CreateTableDefaultPermissions: []
        }
      }).promise();

      this.logger.info('Finishing...');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async createIamDatabase(glueDatabaseName: string): Promise<void> {
    try {
      this.logger.info('Starting createIamDatabase');
      this.logger.debug('Initial Input', glueDatabaseName);

      await this.glue.createDatabase({
        DatabaseInput: {
          Name: glueDatabaseName
        }
      }).promise();

      this.logger.info('Finishing...');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public withNewCredentials(credentials: Credentials): void {
    this.glue = new Glue({ credentials });
  }
}
