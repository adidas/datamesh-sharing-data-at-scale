import { Logger } from '@adidas-data-mesh/common';
import { Domain } from './domain';

export type DataProductObject = {
  readonly 'data-product-name': string;
};

export type DataProductConsumer = {
  readonly 'account': string;
};

export type HandlerInput = {
  readonly 'dataProductObject': DataProductObject;
  readonly 'currentConsumer': DataProductConsumer;
};

export class Handler {
  private readonly domain: Domain;
  private readonly logger: Logger;
  private readonly loggingTag = 'Handler';

  public constructor(domain: Domain, logger: Logger) {
    this.domain = domain;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(input: HandlerInput): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', input);

      const {
        'dataProductObject': { 'data-product-name': dataProductName },
        'currentConsumer': { 'account': consumerAccountId }
      } = input;

      await this.domain.execute(dataProductName, consumerAccountId);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
