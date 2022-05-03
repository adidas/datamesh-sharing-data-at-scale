import { Logger } from '@adidas-data-mesh/common';
import { Domain } from '../../../src/domain';

const logger = Logger.silent();

const glueDatabaseNameIam = 'glueDatabaseName_iam';
const glueDatabaseNameLF = 'glueDatabaseName_lf';

const lakeRoleSessionName = 'lakeRoleSessionName';
const accountId = 'accountId';
const newCredentials = {
  accessKeyId: 'accessKeyId',
  secretAccessKey: 'secretAccessKey',
  sessionToken: 'sessionToken'
};
const awsGlue: any = {};
const awsLakeFormation: any = {};
const awsSts: any = {};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsSts.getRoleCredentials = jest.fn(async () => Promise.resolve(newCredentials));
    awsLakeFormation.withNewCredentials = jest.fn().mockResolvedValue(awsLakeFormation);
    awsLakeFormation.disableIamControlAccess = jest.fn().mockResolvedValue({});
    awsGlue.withNewCredentials = jest.fn().mockResolvedValue(awsGlue);
    awsGlue.createIamDatabase = jest.fn().mockResolvedValue({});
    awsGlue.createLFDatabase = jest.fn().mockResolvedValue({});
  });

  it('Should assume a role', async () => {
    const domain = new Domain({ awsGlue, awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });

    await domain.execute(glueDatabaseNameIam);

    expect(awsSts.getRoleCredentials).toHaveBeenCalledTimes(1);
    expect(awsSts.getRoleCredentials).toHaveBeenCalledWith(lakeRoleSessionName, accountId);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledWith(newCredentials);
    expect(awsGlue.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsGlue.withNewCredentials).toHaveBeenCalledWith(newCredentials);
  });

  it('Should execute the domain successfully for iam', async () => {
    const domain = new Domain({ awsGlue, awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });

    await domain.execute(glueDatabaseNameIam);

    expect(awsGlue.createLFDatabase).toHaveBeenCalledTimes(0);
    expect(awsLakeFormation.disableIamControlAccess).toHaveBeenCalledTimes(0);
    expect(awsGlue.createIamDatabase).toHaveBeenCalledTimes(1);
    expect(awsGlue.createIamDatabase).toHaveBeenCalledWith(glueDatabaseNameIam);
  });

  it('Should execute the domain successfully for lf', async () => {
    const domain = new Domain({ awsGlue, awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });

    await domain.execute(glueDatabaseNameLF);

    expect(awsGlue.createIamDatabase).toHaveBeenCalledTimes(0);
    expect(awsLakeFormation.disableIamControlAccess).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.disableIamControlAccess).toHaveBeenCalledWith(glueDatabaseNameLF);
    expect(awsGlue.createLFDatabase).toHaveBeenCalledTimes(1);
    expect(awsGlue.createLFDatabase).toHaveBeenCalledWith(glueDatabaseNameLF);
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsGlue, awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });
    const unexpectedError = new Error('There has been an error');

    awsGlue.createIamDatabase = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(glueDatabaseNameIam))
        .rejects.toThrow(unexpectedError);
    expect(awsGlue.createIamDatabase).toHaveBeenCalledTimes(1);
    expect(awsGlue.createIamDatabase).toHaveBeenCalledWith(glueDatabaseNameIam);
  });
});
