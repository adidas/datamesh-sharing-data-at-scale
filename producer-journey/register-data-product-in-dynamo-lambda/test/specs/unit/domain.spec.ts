import { Logger } from '@adidas-data-mesh/common';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  DataProductInputsObject, DataProductObject, DataProductOutputsObject, Domain, DomainInput
} from '../../../src/domain';

const logger = Logger.silent();

const dataProductObject: DataProductObject = {
  'data-product-name': 'data-product-name',
  'data-product-owner': 'data-product-owner',
  'data-product-mantainer': 'data-product-mantainer',
  'enterprise-system-landscape-information-tracker': 'enterprise-system-landscape-information-tracker',
  'source-system': 'source-system',
  'edc-data-objects': [ 'foobar' ],
  'usage-patterns': [ 'usage-patterns' ],
  'dq-rules': 'dq-rules'
};
const dataProductInputsObject: DataProductInputsObject = {
  inputs: {
    BDP: {
      tables: [ 'tables' ]
    }
  }
};
const dataProductOutputsObject: DataProductOutputsObject = {
  outputs: {
    tableName: {
      'file-format': 'parquet',
      'partition-columns': [ 'columnName' ],
      'retention-time': {
        unit: 'day',
        time: 30
      }
    },
    tableName2: {
      'file-format': 'avro',
      'partition-columns': [ 'columnName' ],
      'retention-time': {
        unit: 'day',
        time: 30
      }
    }
  }
};
const domainInput: DomainInput = {
  dataProductObject,
  dataProductInputsObject,
  dataProductOutputsObject
};
const awsDynamoDB: any = {};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsDynamoDB.saveDataProductItem = jest.fn().mockResolvedValue({});
  });

  it('Should execute domain successfully', async () => {
    const domain = new Domain({ awsDynamoDB, logger });
    const confluenceTables = [
      {
        'table-name': 'tableName',
        'visibility': 'public',
        'file-format': dataProductOutputsObject.outputs.tableName['file-format'],
        'retention-time': dataProductOutputsObject.outputs.tableName['retention-time'],
        'partition-columns': dataProductOutputsObject.outputs.tableName['partition-columns']
      }, {
        'table-name': 'tableName2',
        'visibility': 'public',
        'file-format': dataProductOutputsObject.outputs.tableName2['file-format'],
        'retention-time': dataProductOutputsObject.outputs.tableName2['retention-time'],
        'partition-columns': dataProductOutputsObject.outputs.tableName2['partition-columns']
      }
    ];

    await domain.execute(domainInput);

    // Gets the new update date
    const [ updateDataProductItemInputCalls ] = getMockObject(awsDynamoDB.saveDataProductItem).mock.calls;
    const [ updateDataProductItemInput ] = updateDataProductItemInputCalls;

    expect(awsDynamoDB.saveDataProductItem).toHaveBeenCalledTimes(1);
    expect(awsDynamoDB.saveDataProductItem).toHaveBeenCalledWith({
      'data-product-name': dataProductObject['data-product-name'],
      'data-product-owner': dataProductObject['data-product-owner'],
      'data-product-mantainer': dataProductObject['data-product-mantainer'],
      'enterprise-system-landscape-information-tracker': dataProductObject['enterprise-system-landscape-information-tracker'],
      'tables': confluenceTables,
      'source-system': dataProductObject['source-system'],
      'edc-data-objects': dataProductObject['edc-data-objects'],
      'usage-patterns': dataProductObject['usage-patterns'],
      'dq-rules': dataProductObject['dq-rules'],
      'inputs': dataProductInputsObject.inputs,
      'updated-at': updateDataProductItemInput['updated-at'],
      'created-at': updateDataProductItemInput['created-at']
    });
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsDynamoDB, logger });
    const unexpectedError = new Error('There has been an error');

    awsDynamoDB.saveDataProductItem = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(domainInput))
        .rejects.toThrow(unexpectedError);
  });
});
