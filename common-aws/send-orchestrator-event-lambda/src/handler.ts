import { Logger } from '@adidas-data-mesh/common';
import { Context } from 'aws-lambda';
import { Domain } from './domain';

export enum EventSources {
  producer = 'journeys.producer',
  consumer = 'journeys.consumer',
  visibility = 'journeys.visibility'
}

export type DataProductObject = {
  readonly 'data-product-name': string;
};

export type HandlerInput = {
  dataProductObject: DataProductObject;
  journeySource: EventSources;
};

export class Handler {
  private readonly domain: Domain;
  private readonly logger: Logger;
  private readonly loggingTag = 'Handler';

  public constructor(domain: Domain, logger: Logger) {
    this.domain = domain;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(input: HandlerInput, context: Context): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', input, context);

      const { dataProductObject, journeySource } = input;

      const { invokedFunctionArn } = context;

      await this.domain.execute(dataProductObject['data-product-name'], journeySource, invokedFunctionArn);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
