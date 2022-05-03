import { Logger } from '@adidas-data-mesh/common';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { filterEmptyStrings } from '../utils/dynamodb-query-builder';

export type Visibility = 'internal' | 'public' | 'confidential';

export type DataProductOutputsFileFormat = 'parquet' | 'avro' | 'json' | 'csv' | 'delta';

export type DataProductOutputsUnitTime = 'month' | 'year' | 'day';

export type DataProductTable = {
  readonly 'table-name': string;
  readonly 'file-format': DataProductOutputsFileFormat;
  readonly 'visibility': Visibility;
  readonly 'partition-columns': Array<string>;
  readonly 'retention-time': {
    readonly unit: DataProductOutputsUnitTime;
    readonly time: number;
  };
};

export type Inputs = {
  readonly [key: string]: {
    readonly tables: Array<string>;
  };
};

export type DataProductObject = {
  readonly 'data-product-name': string;
  readonly 'data-product-owner': string;
  readonly 'data-product-mantainer': string;
  readonly 'enterprise-system-landscape-information-tracker': string;
  readonly 'tables': Array<DataProductTable>;
  readonly 'created-at': string;
  readonly 'updated-at': string;
  readonly 'source-system': string;
  readonly 'edc-data-objects': Array<string>;
  readonly 'usage-patterns': Array<string>;
  readonly 'dq-rules'?: string;
  readonly 'inputs': Inputs;
};

export class AwsDynamoDB {
  private readonly dynamo: DocumentClient;
  private readonly tableName: string;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsDynamoDB';

  public constructor(dynamo: DocumentClient, tableName: string, logger: Logger) {
    this.dynamo = dynamo;
    this.tableName = tableName;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async saveDataProductItem(input: DataProductObject): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', input);

      const params: DocumentClient.PutItemInput = {
        TableName: this.tableName,
        Item: filterEmptyStrings(input)
      };

      this.logger.info('saving metadata', params);

      const result = await this.dynamo.put(params).promise();

      this.logger.info('Finishing...', result);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
