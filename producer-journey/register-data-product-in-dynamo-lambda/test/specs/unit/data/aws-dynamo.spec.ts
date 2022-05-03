import { Logger } from '@adidas-data-mesh/common';
import {
  AwsDynamoDB, Inputs, DataProductObject, DataProductTable
} from '../../../../src/data/aws-dynamodb';
import { filterEmptyStrings } from '../../../../src/utils/dynamodb-query-builder';

const logger = Logger.silent();

const confluenceTables: Array<DataProductTable> = [
  {
    'table-name': 'table-name',
    'visibility': 'public',
    'file-format': 'parquet',
    'partition-columns': [ 'columnName' ],
    'retention-time': {
      unit: 'day',
      time: 30
    }
  }
];
const dataProductInputsObject: Inputs = {
  BDP: {
    tables: [ 'tables' ]
  }
};
const dataProductItem: DataProductObject = {
  'data-product-name': 'data-product-name',
  'data-product-owner': 'data-product-owner',
  'data-product-mantainer': 'data-product-mantainer',
  'enterprise-system-landscape-information-tracker': 'enterprise-system-landscape-information-tracker',
  'source-system': 'source-system',
  'edc-data-objects': [ 'edc-data-objects' ],
  'usage-patterns': [ 'usage-patterns' ],
  'dq-rules': 'dq-rules',
  'tables': confluenceTables,
  'updated-at': 'updated-at',
  'created-at': 'created-at',
  'inputs': dataProductInputsObject
};
const tableName = 'tableName';

const putResponse = { status: 200 };
const putMock = jest.fn(async () => Promise.resolve(putResponse));
const dynamoClient: any = {};

describe('# AwsDynamoDB', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    dynamoClient.put = jest.fn(() => ({ promise: putMock }));
  });

  describe('saveDataProductItem()', () => {
    it('Should save a Data Product Item successfully', async () => {
      const awsDynamoDB = new AwsDynamoDB(dynamoClient, tableName, logger);
      const params = {
        TableName: tableName,
        Item: filterEmptyStrings(dataProductItem)
      };

      await awsDynamoDB.saveDataProductItem(dataProductItem);

      expect(putMock).toHaveBeenCalledTimes(1);
      expect(dynamoClient.put).toHaveBeenCalledTimes(1);
      expect(dynamoClient.put).toHaveBeenCalledWith(params);
    });

    it('Should throw an error since aws layer has failed', async () => {
      const awsDynamoDB = new AwsDynamoDB(dynamoClient, tableName, logger);
      const unexpectedError = new Error('There has been an error');
      const params = {
        TableName: tableName,
        Item: filterEmptyStrings(dataProductItem)
      };

      putMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsDynamoDB.saveDataProductItem(dataProductItem))
          .rejects.toThrow(unexpectedError);
      expect(putMock).toHaveBeenCalledTimes(1);
      expect(dynamoClient.put).toHaveBeenCalledTimes(1);
      expect(dynamoClient.put).toHaveBeenCalledWith(params);
    });
  });
});
