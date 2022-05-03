import { Logger } from '@adidas-data-mesh/common';
import { DataProductInputsObject, DataProductOutputsObject, DataProductVisibilityObject, Handler, HandlerInput } from '../../../src/handler';

const logger = Logger.silent();

const dataProductObject = {
  'data-product-name': 'data-product-name',
  'data-product-owner': 'data-product-owner',
  'data-product-mantainer': 'data-product-mantainer',
  'enterprise-system-landscape-information-tracker': 'enterprise-system-landscape-information-tracker',
  'source-system': 'source-system',
  'edc-data-objects': [ 'foobar' ],
  'usage-patterns': [ 'usage-patterns' ],
  'dq-rules': 'dq-rules'
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
const handlerInput: HandlerInput = {
  dataProductObject,
  dataProductVisibilityObject,
  dataProductOutputsObject,
  dataProductInputsObject
};
const domain: any = {};

describe('# Handler', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    domain.execute = jest.fn(async () => Promise.resolve());
  });

  it('Should execute the handler successfully', async () => {
    const handler = new Handler(domain, logger);
    const executeInput = handlerInput;
    const domainInput = executeInput;

    await handler.execute(executeInput);

    expect(domain.execute).toHaveBeenCalledTimes(1);
    expect(domain.execute).toHaveBeenCalledWith(domainInput);
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
