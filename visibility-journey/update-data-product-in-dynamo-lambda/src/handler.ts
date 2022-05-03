import { Logger } from '@adidas-data-mesh/common';
import { Domain } from './domain';

export type DataProductObject = {
  readonly 'data-product-name': string;
  readonly 'data-product-owner': string;
  readonly 'data-product-mantainer': string;
  readonly 'enterprise-system-landscape-information-tracker': string;
  readonly 'source-system': string;
  readonly 'edc-data-objects': Array<string>;
  readonly 'usage-patterns': Array<string>;
  readonly 'dq-rules'?: string;
};

export type DataProductInputsObject = {
  readonly inputs: {
    readonly [key: string]: {
      readonly tables: Array<string>;
    };
  };
};

export type DataProductOutputsFileFormat = 'parquet' | 'avro' | 'json' | 'csv' | 'delta';

export type DataProductOutputsUnitTime = 'month' | 'year' | 'day';

export type DataProductOutputsObject = {
  readonly outputs: {
    readonly [key: string]: {
      readonly 'file-format': DataProductOutputsFileFormat;
      readonly 'partition-columns'?: Array<string>;
      readonly 'retention-time'?: {
        readonly unit: DataProductOutputsUnitTime;
        readonly time: number;
      };
    };
  };
};

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
  readonly dataProductObject: DataProductObject;
  readonly dataProductVisibilityObject: DataProductVisibilityObject;
  readonly dataProductInputsObject: DataProductInputsObject;
  readonly dataProductOutputsObject: DataProductOutputsObject;
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
