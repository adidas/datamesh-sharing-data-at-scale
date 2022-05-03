import { Logger } from '@adidas-data-mesh/common';
import { Domain } from '../../../src/domain';
import { DataProductLFTagValues } from '../../../src/lf-tags.model';

const logger = Logger.silent();

const lakeRoleSessionName = 'lakeRoleSessionName';
const accountId = 'accountId';
const domainInput = 'domainInput';
const dataProductLFTagValues = Object.values(DataProductLFTagValues);
const newCredentials = {
  accessKeyId: 'accessKeyId',
  secretAccessKey: 'secretAccessKey',
  sessionToken: 'sessionToken'
};
const awsLakeFormation: any = {};
const awsSts: any = {};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsSts.getRoleCredentials = jest.fn(async () => Promise.resolve(newCredentials));
    awsLakeFormation.withNewCredentials = jest.fn().mockResolvedValue(awsLakeFormation);
    awsLakeFormation.createDataProductTag = jest.fn().mockResolvedValue({});
  });

  it('Should assume the producer role for awsLakeFormation', async () => {
    const domain = new Domain({ awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });

    await domain.execute(domainInput);

    expect(awsSts.getRoleCredentials).toHaveBeenCalledTimes(1);
    expect(awsSts.getRoleCredentials).toHaveBeenCalledWith(lakeRoleSessionName, accountId);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledWith(newCredentials);
  });

  it('Should execute the domain successfully and call addVisibilityLFTagToTable', async () => {
    const domain = new Domain({ awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });
    const dataProductTag = {
      TagKey: domainInput,
      TagValues: dataProductLFTagValues
    };

    await domain.execute(domainInput);

    expect(awsLakeFormation.createDataProductTag).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.createDataProductTag).toHaveBeenCalledWith(dataProductTag);
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });
    const unexpectedError = new Error('There has been an error');
    const dataProductTag = {
      TagKey: domainInput,
      TagValues: dataProductLFTagValues
    };

    awsLakeFormation.createDataProductTag = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(domainInput))
        .rejects.toThrow(unexpectedError);
    expect(awsLakeFormation.createDataProductTag).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.createDataProductTag).toHaveBeenCalledWith(dataProductTag);
  });
});
