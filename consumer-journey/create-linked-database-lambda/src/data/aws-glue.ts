import { Credentials, Glue } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';

export class AwsGlue {
  private glue: Glue;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsGlue';
  private readonly accountId: string;

  public constructor(glue: Glue, accountId: string, logger: Logger) {
    this.glue = glue;
    this.logger = logger.withTag(this.loggingTag);
    this.accountId = accountId;
  }

  public async createLinkedDatabase(glueDatabaseName: string): Promise<void> {
    try {
      this.logger.info('Starting createLinkedDatabase');
      this.logger.debug('Initial Input', glueDatabaseName);

      await this.glue.createDatabase({
        DatabaseInput: {
          Name: glueDatabaseName,
          TargetDatabase: {
            DatabaseName: glueDatabaseName,
            CatalogId: this.accountId
          }
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
