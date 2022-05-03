import { Logger } from '@adidas-data-mesh/common';
import { Domain } from '../../../src/domain';

const logger = Logger.silent();

const glueDatabaseName = 'glueDatabaseName';
const consumerRoleName = 'lakeformation-consumer-role';
const consumerRoleAccount = '123123123123';
const consumerRoleArn = `arn:aws:iam::${ consumerRoleAccount }:role/${ consumerRoleName }`;

const newCredentials = {
  accessKeyId: 'accessKeyId',
  secretAccessKey: 'secretAccessKey',
  sessionToken: 'sessionToken'
};
const awsGlue: any = {};
const awsSts: any = {};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsSts.getRoleCredentials = jest.fn(async () => Promise.resolve(newCredentials));
    awsGlue.withNewCredentials = jest.fn().mockResolvedValue(awsGlue);
    awsGlue.createLinkedDatabase = jest.fn().mockResolvedValue({});
  });

  it('Should assume a role', async () => {
    const domain = new Domain({ awsSts, awsGlue, logger });

    await domain.execute(glueDatabaseName, consumerRoleArn);

    expect(awsSts.getRoleCredentials).toHaveBeenCalledTimes(1);
    expect(awsSts.getRoleCredentials).toHaveBeenCalledWith(consumerRoleName, consumerRoleAccount);
    expect(awsGlue.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsGlue.withNewCredentials).toHaveBeenCalledWith(newCredentials);
  });

  it('Should execute the domain successfully', async () => {
    const domain = new Domain({ awsSts, awsGlue, logger });

    await domain.execute(glueDatabaseName, consumerRoleArn);

    expect(awsGlue.createLinkedDatabase).toHaveBeenCalledTimes(1);
    expect(awsGlue.createLinkedDatabase).toHaveBeenCalledWith(glueDatabaseName);
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsSts, awsGlue, logger });
    const unexpectedError = new Error('There has been an error');

    awsGlue.createLinkedDatabase = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(glueDatabaseName, consumerRoleArn))
        .rejects.toThrow(unexpectedError);
    expect(awsGlue.createLinkedDatabase).toHaveBeenCalledTimes(1);
    expect(awsGlue.createLinkedDatabase).toHaveBeenCalledWith(glueDatabaseName);
  });
});
