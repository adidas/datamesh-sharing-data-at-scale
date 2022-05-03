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
  'edc-data-objects': [ 'foobar' ],
  'usage-patterns': [ 'usage-patterns' ],
  'dq-rules': 'dq-rules',
  'inputs': dataProductInputsObject,
  'tables': confluenceTables,
  'updated-at': 'updated-at'
};
const filteredItem = filterEmptyStrings(dataProductItem);
const tableName = 'tableName';

const updateResponse = { status: 200 };
const updateMock = jest.fn(async () => Promise.resolve(updateResponse));
const dynamoClient: any = {};

describe('# AwsDynamoDB', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    dynamoClient.update = jest.fn(() => ({ promise: updateMock }));
  });

  describe('saveDataProductItem()', () => {
    it('Should save a Data Product Item successfully', async () => {
      const awsDynamoDB = new AwsDynamoDB(dynamoClient, tableName, logger);
      const params = {
        TableName: tableName,
        Key: {
          'data-product-name': filteredItem['data-product-name']
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
          ':dataProductOwner': filteredItem['data-product-owner'],
          ':dataProductMantainer': filteredItem['data-product-mantainer'],
          ':sourceSystem': filteredItem['source-system'],
          ':edcDataObjects': filteredItem['edc-data-objects'],
          ':usagePatterns': filteredItem['usage-patterns'],
          ':dqRules': filteredItem['dq-rules'],
          ':inputs': filteredItem.inputs,
          ':tables': filteredItem.tables,
          ':updatedAt': filteredItem['updated-at']
        }
      };

      await awsDynamoDB.updateDataProductItem(dataProductItem);

      expect(updateMock).toHaveBeenCalledTimes(1);
      expect(dynamoClient.update).toHaveBeenCalledTimes(1);
      expect(dynamoClient.update).toHaveBeenCalledWith(params);
    });

    it('Should throw an error since aws layer has failed', async () => {
      const awsDynamoDB = new AwsDynamoDB(dynamoClient, tableName, logger);
      const unexpectedError = new Error('There has been an error');
      const params = {
        TableName: tableName,
        Key: {
          'data-product-name': filteredItem['data-product-name']
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
          ':dataProductOwner': filteredItem['data-product-owner'],
          ':dataProductMantainer': filteredItem['data-product-mantainer'],
          ':sourceSystem': filteredItem['source-system'],
          ':edcDataObjects': filteredItem['edc-data-objects'],
          ':usagePatterns': filteredItem['usage-patterns'],
          ':dqRules': filteredItem['dq-rules'],
          ':inputs': filteredItem.inputs,
          ':tables': filteredItem.tables,
          ':updatedAt': filteredItem['updated-at']
        }
      };

      updateMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsDynamoDB.updateDataProductItem(dataProductItem))
          .rejects.toThrow(unexpectedError);
      expect(updateMock).toHaveBeenCalledTimes(1);
      expect(dynamoClient.update).toHaveBeenCalledTimes(1);
      expect(dynamoClient.update).toHaveBeenCalledWith(params);
    });
  });
});
