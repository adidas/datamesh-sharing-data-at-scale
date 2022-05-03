import { Logger } from '@adidas-data-mesh/common';
import { Domain } from '../../../src/domain';

const logger = Logger.silent();

const dataProductLFTagName = 'dataProductLFTagName';
const producerAccountId = 'producerAccountId';

const lakeRoleSessionName = 'lakeRoleSessionName';
const accountId = 'accountId';
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
    awsLakeFormation.grantDatabasePermissions = jest.fn().mockResolvedValue({});
    awsLakeFormation.grantTablePermissions = jest.fn().mockResolvedValue({});
  });

  it('Should assume a role', async () => {
    const domain = new Domain({ awsLakeFormation, awsSts, accountId, lakeRoleSessionName, logger });

    await domain.execute(dataProductLFTagName, producerAccountId);

    expect(awsSts.getRoleCredentials).toHaveBeenCalledTimes(1);
    expect(awsSts.getRoleCredentials).toHaveBeenCalledWith(lakeRoleSessionName, accountId);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledWith(newCredentials);
  });

  it('Should execute the domain successfully', async () => {
    const domain = new Domain({ awsLakeFormation, awsSts, accountId, lakeRoleSessionName, logger });

    await domain.execute(dataProductLFTagName, producerAccountId);

    expect(awsLakeFormation.grantDatabasePermissions).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.grantDatabasePermissions).toHaveBeenCalledWith(dataProductLFTagName, producerAccountId);
    expect(awsLakeFormation.grantTablePermissions).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.grantTablePermissions).toHaveBeenCalledWith(dataProductLFTagName, producerAccountId);
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsLakeFormation, awsSts, accountId, lakeRoleSessionName, logger });
    const unexpectedError = new Error('There has been an error');

    awsLakeFormation.grantDatabasePermissions = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(dataProductLFTagName, producerAccountId))
        .rejects.toThrow(unexpectedError);
    expect(awsLakeFormation.grantDatabasePermissions).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.grantDatabasePermissions).toHaveBeenCalledWith(dataProductLFTagName, producerAccountId);
    expect(awsLakeFormation.grantTablePermissions).toHaveBeenCalledTimes(0);
  });
});
