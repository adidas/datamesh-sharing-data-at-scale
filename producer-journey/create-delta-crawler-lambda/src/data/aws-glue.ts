import { Glue } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';

export class AwsGlue {
  private readonly glue: Glue;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsGlue';

  public constructor(glue: Glue, logger: Logger) {
    this.glue = glue;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async createDeltaCrawler(
      deltaCrawlerName: string, deltaTables: Array<string>, roleArn: string
  ): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', deltaCrawlerName);

      const params = {
        Targets: {
          DeltaTargets: [
            {
              DeltaTables: deltaTables,
              WriteManifest: true
            }
          ]
        },
        Schedule: 'cron(0 20 * * ? *)',
        Configuration: '{"Version":1,"Grouping":{"TableLevelConfiguration":2}}',
        DatabaseName: deltaCrawlerName,
        Name: deltaCrawlerName,
        SchemaChangePolicy: {
          DeleteBehavior: 'DEPRECATE_IN_DATABASE',
          UpdateBehavior: 'UPDATE_IN_DATABASE'
        },
        Role: roleArn
      };

      this.logger.debug('Params', params);

      await this.glue.createCrawler(params).promise();

      this.logger.info('Finishing...');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
