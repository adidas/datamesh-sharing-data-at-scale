import { Logger } from '@adidas-data-mesh/common';
import {
  DataProductConsumersObject, DataProductInputsObject, DataProductObject, DataProductOutputsObject,
  DataProductProducerInfoObject, DataProductVisibilityObject
} from '../../../src/data-product-assets.model';
import { Domain, DomainOutput } from '../../../src/domain';

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
const domainOutput: DomainOutput = {
  dataProductObject,
  dataProductProducerInfoObject,
  dataProductInputsObject,
  dataProductOutputsObject,
  dataProductVisibilityObject,
  dataProductConsumersObject
};

const dataProductObjectName = 'data-product.json';
const dataProductProducerInfoObjectName = 'data-product-producer-info.json';
const dataProductInputsObjectName = 'data-product-inputs.json';
const dataProductOutputsObjectName = 'data-product-outputs.json';
const dataProductVisibilityObjectName = 'data-product-visibility.json';
const dataProductConsumersObjectName = 'data-product-consumers.json';
const domainInput = 'data-product-name';
const awsS3: any = {};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsS3.getS3Object = jest.fn()
      .mockResolvedValueOnce(dataProductObject)
      .mockResolvedValueOnce(dataProductProducerInfoObject)
      .mockResolvedValueOnce(dataProductInputsObject)
      .mockResolvedValueOnce(dataProductOutputsObject)
      .mockResolvedValueOnce(dataProductVisibilityObject)
      .mockResolvedValueOnce(dataProductConsumersObject);
  });

  it('Should execute the domain successfully', async () => {
    const domain = new Domain({ awsS3, logger });
    const executeInput = domainInput;

    const response = await domain.execute(executeInput);

    expect(awsS3.getS3Object).toHaveBeenCalledTimes(6);
    expect(awsS3.getS3Object).toHaveBeenNthCalledWith(1, `${ domainInput }/${ dataProductObjectName }`);
    expect(awsS3.getS3Object).toHaveBeenNthCalledWith(2, `${ domainInput }/${ dataProductProducerInfoObjectName }`);
    expect(awsS3.getS3Object).toHaveBeenNthCalledWith(3, `${ domainInput }/${ dataProductInputsObjectName }`);
    expect(awsS3.getS3Object).toHaveBeenNthCalledWith(4, `${ domainInput }/${ dataProductOutputsObjectName }`);
    expect(awsS3.getS3Object).toHaveBeenNthCalledWith(5,
      `${ domainInput }/${ dataProductVisibilityObjectName }`);
    expect(awsS3.getS3Object).toHaveBeenNthCalledWith(6,
      `${ domainInput }/${ dataProductConsumersObjectName }`);
    expect(response).toEqual(domainOutput);
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsS3, logger });
    const executeInput = domainInput;
    const unexpectedError = new Error('There has been an error');

    awsS3.getS3Object = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(executeInput))
        .rejects.toThrow(unexpectedError);
    expect(awsS3.getS3Object).toHaveBeenCalledTimes(6);
    expect(awsS3.getS3Object).toHaveBeenNthCalledWith(1, `${ domainInput }/${ dataProductObjectName }`);
    expect(awsS3.getS3Object).toHaveBeenNthCalledWith(2, `${ domainInput }/${ dataProductProducerInfoObjectName }`);
    expect(awsS3.getS3Object).toHaveBeenNthCalledWith(3, `${ domainInput }/${ dataProductInputsObjectName }`);
    expect(awsS3.getS3Object).toHaveBeenNthCalledWith(4, `${ domainInput }/${ dataProductOutputsObjectName }`);
    expect(awsS3.getS3Object).toHaveBeenNthCalledWith(5,
      `${ domainInput }/${ dataProductVisibilityObjectName }`);
    expect(awsS3.getS3Object).toHaveBeenNthCalledWith(6,
      `${ domainInput }/${ dataProductConsumersObjectName }`);
  });
});
