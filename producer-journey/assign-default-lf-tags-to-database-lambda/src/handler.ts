import { Logger } from '@adidas-data-mesh/common';
import { Domain } from './domain';

export type DataProductObject = {
  readonly 'data-product-name': string;
};

export type HandlerInput = {
  dataProductObject: DataProductObject;
  glueDatabaseName: string;
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

      const { glueDatabaseName, dataProductObject } = input;
      const { 'data-product-name': dataProductName } = dataProductObject;

      await this.domain.execute(glueDatabaseName, dataProductName);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
