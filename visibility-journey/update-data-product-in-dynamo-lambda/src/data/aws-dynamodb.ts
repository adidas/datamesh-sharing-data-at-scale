import { Logger } from '@adidas-data-mesh/common';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export type Visibility = 'internal' | 'public' | 'confidential';

export type DataProductOutputsFileFormat = 'parquet' | 'avro' | 'json' | 'csv' | 'delta';

export type DataProductOutputsUnitTime = 'month' | 'year' | 'day';

export type DataProductTable = {
  readonly 'table-name': string;
  readonly 'visibility': Visibility;
  readonly 'file-format': DataProductOutputsFileFormat;
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
  readonly 'source-system': string;
  readonly 'edc-data-objects': Array<string>;
  readonly 'usage-patterns': Array<string>;
  readonly 'dq-rules': string;
  readonly 'inputs': Inputs;
  readonly 'tables': Array<DataProductTable>;
  readonly 'updated-at': string;
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

  public async updateDataProductItem(dataProductObject: DataProductObject): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', dataProductObject);

      const params: DocumentClient.UpdateItemInput = {
        TableName: this.tableName,
        Key: {
          'data-product-name': dataProductObject['data-product-name']
        },
        UpdateExpression:
          `SET #dataProductOwner = :dataProductOwner, #dataProductMantainer = :dataProductMantainer,
          #sourceSystem = :sourceSystem, #edcDataObjects = :edcDataObjects, #usagePatterns = :usagePatterns,
          #dqRules = :dqRules, inputs = :inputs, tables = :tables, #updatedAt = :updatedAt`,
        ExpressionAttributeNames: {
          '#dataProductOwner': 'data-product-owner',
          '#dataProductMantainer': 'data-product-mantainer',
          '#sourceSystem': 'source-system',
          '#edcDataObjects': 'edc-data-objects',
          '#usagePatterns': 'usage-patterns',
          '#dqRules': 'dq-rules',
          '#updatedAt': 'updated-at'
        },
        ExpressionAttributeValues: {
          ':dataProductOwner': dataProductObject['data-product-owner'],
          ':dataProductMantainer': dataProductObject['data-product-mantainer'],
          ':sourceSystem': dataProductObject['source-system'],
          ':edcDataObjects': dataProductObject['edc-data-objects'],
          ':usagePatterns': dataProductObject['usage-patterns'],
          ':dqRules': dataProductObject['dq-rules'],
          ':inputs': dataProductObject.inputs,
          ':tables': dataProductObject.tables,
          ':updatedAt': dataProductObject['updated-at']
        }
      };

      this.logger.info('Updating data product tables', params);

      const result = await this.dynamo.update(params).promise();

      this.logger.info('Finishing...', result);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
