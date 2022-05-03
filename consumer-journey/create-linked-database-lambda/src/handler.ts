import { Logger } from '@adidas-data-mesh/common';
import { Domain } from './domain';

export type DataProductConsumer = {
  readonly 'databaseName': string;
  readonly 'consumer-role-arn': string;
};

export class Handler {
  private readonly domain: Domain;
  private readonly logger: Logger;
  private readonly loggingTag = 'Handler';

  public constructor(domain: Domain, logger: Logger) {
    this.domain = domain;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(input: DataProductConsumer): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', input);

      const { databaseName, 'consumer-role-arn': consumerRoleArn } = input;

      await this.domain.execute(databaseName, consumerRoleArn);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
