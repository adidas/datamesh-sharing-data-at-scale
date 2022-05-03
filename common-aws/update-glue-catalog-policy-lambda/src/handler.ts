import { Logger } from '@adidas-data-mesh/common';
import { SQSEvent } from 'aws-lambda';
import { Domain } from './domain';

export class Handler {
  private readonly domain: Domain;
  private readonly logger: Logger;
  private readonly loggingTag = 'Handler';

  public constructor(domain: Domain, logger: Logger) {
    this.domain = domain;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(input: SQSEvent): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', input);

      await input.Records?.reduce(async (previousPromise, recordInfo) => {
        await previousPromise;
        this.logger.debug('Record Info:', recordInfo);

        return this.domain.execute(recordInfo.body);
      }, Promise.resolve());

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
