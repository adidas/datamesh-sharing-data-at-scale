import { Logger } from '@adidas-data-mesh/common';
import { Domain } from '../../../src/domain';

const logger = Logger.silent();

const databaseName = 'databaseName';
const consumerAccountId = 'consumerAccountId';

const consumerRoleName = 'lakeformation-consumer-role';
const consumerRoleAccount = '123123123123';
const consumerRoleArn = `arn:aws:iam::${ consumerRoleAccount }:role/${ consumerRoleName }`;
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
    const domain = new Domain({ awsLakeFormation, awsSts, logger });

    await domain.execute(databaseName, consumerRoleArn);

    expect(awsSts.getRoleCredentials).toHaveBeenCalledTimes(1);
    expect(awsSts.getRoleCredentials).toHaveBeenCalledWith(consumerRoleName, consumerRoleAccount);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledWith(newCredentials);
  });

  it('Should execute the domain successfully', async () => {
    const domain = new Domain({ awsLakeFormation, awsSts, logger });

    await domain.execute(databaseName, consumerAccountId);

    expect(awsLakeFormation.grantDatabasePermissions).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.grantDatabasePermissions).toHaveBeenCalledWith(databaseName, consumerAccountId);
    expect(awsLakeFormation.grantTablePermissions).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.grantTablePermissions).toHaveBeenCalledWith(databaseName, consumerAccountId);
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsLakeFormation, awsSts, logger });
    const unexpectedError = new Error('There has been an error');

    awsLakeFormation.grantDatabasePermissions = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(databaseName, consumerAccountId))
        .rejects.toThrow(unexpectedError);
    expect(awsLakeFormation.grantDatabasePermissions).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.grantDatabasePermissions).toHaveBeenCalledWith(databaseName, consumerAccountId);
    expect(awsLakeFormation.grantTablePermissions).toHaveBeenCalledTimes(0);
  });
});
