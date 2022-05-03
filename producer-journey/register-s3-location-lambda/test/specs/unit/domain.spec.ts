import { Logger } from '@adidas-data-mesh/common';
import { Domain } from '../../../src/domain';

const logger = Logger.silent();

const s3LocationArn = 's3LocationArn';
const producerAccountId = 'producerAccountId';
const accountId = 'centralAccountId';
const lakeRoleSessionName = 'lakeRoleSessionName';

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
    awsLakeFormation.registerResource = jest.fn().mockResolvedValue({});
    awsLakeFormation.grantLocationAccess = jest.fn().mockResolvedValue({});
  });

  it('Should assume a role', async () => {
    const domain = new Domain({ accountId, lakeRoleSessionName, awsLakeFormation, awsSts, logger });

    await domain.execute(s3LocationArn, producerAccountId);

    expect(awsSts.getRoleCredentials).toHaveBeenCalledTimes(1);
    expect(awsSts.getRoleCredentials).toHaveBeenCalledWith(lakeRoleSessionName, accountId);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledWith(newCredentials);
  });

  it('Should execute the domain successfully for iam', async () => {
    const domain = new Domain({ accountId, lakeRoleSessionName, awsLakeFormation, awsSts, logger });
    const roleArn = `arn:aws:iam::${ accountId }:role/${ lakeRoleSessionName }`;

    await domain.execute(s3LocationArn, producerAccountId);

    expect(awsLakeFormation.registerResource).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.registerResource).toHaveBeenCalledWith(s3LocationArn, roleArn);
    expect(awsLakeFormation.grantLocationAccess).toHaveBeenCalledTimes(2);
    expect(awsLakeFormation.grantLocationAccess).toHaveBeenNthCalledWith(1, s3LocationArn, roleArn);
    expect(awsLakeFormation.grantLocationAccess).toHaveBeenNthCalledWith(2, s3LocationArn, producerAccountId);
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ accountId, lakeRoleSessionName, awsLakeFormation, awsSts, logger });
    const roleArn = `arn:aws:iam::${ accountId }:role/${ lakeRoleSessionName }`;
    const unexpectedError = new Error('There has been an error');

    awsLakeFormation.registerResource = jest.fn().mockRejectedValue(unexpectedError);

    await expect(async () => domain.execute(s3LocationArn, producerAccountId))
        .rejects.toThrow(unexpectedError);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledTimes(0);
    expect(awsLakeFormation.registerResource).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.registerResource).toHaveBeenCalledWith(s3LocationArn, roleArn);
    expect(awsLakeFormation.grantLocationAccess).toHaveBeenCalledTimes(0);
  });
});
