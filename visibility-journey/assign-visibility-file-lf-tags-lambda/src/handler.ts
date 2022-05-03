import { Logger } from '@adidas-data-mesh/common';
import { Domain } from './domain';

export type Visibility = 'internal' | 'public' | 'confidential';

export type DataProductVisibilityObject = {
  readonly tables: Array<{
    readonly name: string;
    readonly visibility: Visibility;
    readonly columns?: Array<{
      readonly name: string;
      readonly pii?: boolean;
      readonly pci?: boolean;
    }>;
  }>;
};

export type HandlerInput = {
  readonly dataProductVisibilityObject: DataProductVisibilityObject;
  readonly glueDatabaseName: string;
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

      await this.domain.execute(input);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
