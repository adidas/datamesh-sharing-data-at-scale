import { Logger } from '@adidas-data-mesh/common';
import {
  DataProductConsumersObject, DataProductInputsObject, DataProductObject,
  DataProductOutputsObject, DataProductProducerInfoObject, DataProductVisibilityObject
} from './data-product-assets.model';
import { Domain } from './domain';

export type HandlerOutput = {
  readonly dataProductObject: DataProductObject;
  readonly dataProductProducerInfoObject: DataProductProducerInfoObject;
  readonly dataProductInputsObject: DataProductInputsObject;
  readonly dataProductOutputsObject: DataProductOutputsObject;
  readonly dataProductVisibilityObject: DataProductVisibilityObject;
  readonly dataProductConsumersObject: DataProductConsumersObject;
};

export class Handler {
  private readonly domain: Domain;
  private readonly logger: Logger;
  private readonly loggingTag = 'Handler';

  public constructor(domain: Domain, logger: Logger) {
    this.domain = domain;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(input: string): Promise<HandlerOutput> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', input);

      const dataProductAssets = await this.domain.execute(input);

      this.logger.info('Finishing');

      return dataProductAssets;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
