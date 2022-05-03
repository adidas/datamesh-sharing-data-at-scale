import { Logger } from '@adidas-data-mesh/common';
import {
  DataProductObject, DataProductVisibilityObject, DataProductConsumersObject, DataProductProducerInfoObject,
  DataProductInputsObject, DataProductOutputsObject
} from '../../../src/data-product-assets.model';
import { Handler, HandlerOutput } from '../../../src/handler';

const logger = Logger.silent();

const dataProductObject: DataProductObject = {
  'data-product-name': 'data-product-name',
  'data-product-owner': 'data-product-owner',
  'data-product-mantainer': 'data-product-mantainer',
  'edc-data-objects': [ 'edc-data-objects' ],
  'source-system': 'source-system',
  'enterprise-system-landscape-information-tracker': 'enterprise-system-landscape-information-tracker',
  'dq-rules': 'dq-rules',
  'usage-patterns': [ 'usage-patterns' ],
  'version': 'version'
};
const dataProductProducerInfoObject: DataProductProducerInfoObject = {
  'account-type': 'aws',
  'producer-role-arn': 'producer-role-arn',
  'producer-account-id': 'producer-account-id',
  'bucket-name': 'bucket-name'
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
    'table-name': {
      'file-format': 'parquet',
      'port-type': 'blob',
      'location': 'location',
      'partition-columns': [ 'partition-columns' ],
      'retention-time': {
        unit: 'day',
        time: 2
      }
    }
  }
};
const dataProductVisibilityObject: DataProductVisibilityObject = {
  tables: [
    {
      name: 'tableName',
      visibility: 'internal',
      columns: [
        {
          name: 'columnName',
          pci: true
        }
      ]
    }
  ]
};
const dataProductConsumersObject: DataProductConsumersObject = {
  consumers: [
    {
      'account': 'account',
      'contact': 'contact',
      'type': 'lakeformation',
      'team': 'team',
      'consumer-role-arn': 'consumer-role-arn'
    }
  ]
};
const handlerOutput: HandlerOutput = {
  dataProductObject,
  dataProductProducerInfoObject,
  dataProductInputsObject,
  dataProductOutputsObject,
  dataProductVisibilityObject,
  dataProductConsumersObject
};

const handlerInput = 'data-product-bame';
const domain: any = {};

describe('# Handler', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    domain.execute = jest.fn(async () => Promise.resolve(handlerOutput));
  });

  it('Should execute the handler successfully', async () => {
    const handler = new Handler(domain, logger);
    const executeInput = handlerInput;
    const domainInput = executeInput;

    const response = await handler.execute(executeInput);

    expect(domain.execute).toHaveBeenCalledTimes(1);
    expect(domain.execute).toHaveBeenCalledWith(domainInput);
    expect(response).toBe(handlerOutput);
  });

  it('Should throw an error since the domain has failed', async () => {
    const handler = new Handler(domain, logger);
    const executeInput = handlerInput;
    const domainInput = executeInput;
    const unexpectedError = new Error('There has been an error');

    domain.execute = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => handler.execute(executeInput))
        .rejects.toThrow(unexpectedError);
    expect(domain.execute).toHaveBeenCalledTimes(1);
    expect(domain.execute).toHaveBeenCalledWith(domainInput);
  });
});
