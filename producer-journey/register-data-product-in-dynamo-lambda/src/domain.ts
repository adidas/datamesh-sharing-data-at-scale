import { Logger } from '@adidas-data-mesh/common';
import { AwsDynamoDB, DataProductTable } from './data/aws-dynamodb';

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

export type DomainInput = {
  readonly dataProductObject: DataProductObject;
  readonly dataProductInputsObject: DataProductInputsObject;
  readonly dataProductOutputsObject: DataProductOutputsObject;
};

type DomainConfig = {
  readonly awsDynamoDB: AwsDynamoDB;
  readonly logger: Logger;
};

export class Domain {
  private readonly awsDynamoDB: AwsDynamoDB;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';

  public constructor({ awsDynamoDB, logger }: DomainConfig) {
    this.awsDynamoDB = awsDynamoDB;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(input: DomainInput): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', input);

      const { dataProductObject, dataProductInputsObject, dataProductOutputsObject } = input;

      const confluenceTables: Array<DataProductTable> =
        Object.keys(dataProductOutputsObject.outputs).map((tableName) => ({
          'table-name': tableName,
          'visibility': 'public',
          'file-format': dataProductOutputsObject.outputs[tableName]['file-format'],
          'retention-time': dataProductOutputsObject.outputs[tableName]['retention-time'] ?? {
            unit: 'day', time: 0
          },
          'partition-columns': dataProductOutputsObject.outputs[tableName]['partition-columns'] ?? []
        }));

      this.logger.debug('Confluence Tables', confluenceTables);

      const currentDate = new Date().toISOString();

      const result = await this.awsDynamoDB.saveDataProductItem({
        'data-product-name': dataProductObject['data-product-name'],
        'data-product-owner': dataProductObject['data-product-owner'],
        'data-product-mantainer': dataProductObject['data-product-mantainer'],
        'enterprise-system-landscape-information-tracker': dataProductObject['enterprise-system-landscape-information-tracker'],
        'tables': confluenceTables,
        'source-system': dataProductObject['source-system'],
        'edc-data-objects': dataProductObject['edc-data-objects'],
        'usage-patterns': dataProductObject['usage-patterns'],
        'dq-rules': dataProductObject['dq-rules'] ?? '',
        'inputs': dataProductInputsObject.inputs,
        'created-at': currentDate,
        'updated-at': currentDate
      });

      this.logger.info('Finishing', result);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
