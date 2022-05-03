import { Credentials } from 'aws-sdk';
import { getMockObject } from '@adidas-data-mesh/testing';
import { AwsSts } from '../../../../src/aws-sdk-utils/aws-sts';
import { Logger } from '../../../../src/logger';

jest.mock('aws-sdk', () => ({ Credentials: jest.fn() }));

const logger = Logger.silent();

const lakeRoleSessionName = 'lakeRoleSessionName';
const accountId = 'accountId';
const assumeRoleOutput = {
  Credentials: {
    AccessKeyId: 'accessKeyId',
    SecretAccessKey: 'secretAccessKey',
    SessionToken: 'sessionToken'
  }
};
const sts: any = {};
const assumeRoleMock = jest.fn(async () => Promise.resolve(assumeRoleOutput));

describe('# AwsSts', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    sts.assumeRole = jest.fn(() => ({ promise: assumeRoleMock }));
  });

  it('Should getRoleCredentials successfully', async () => {
    const awsSts = new AwsSts(sts, logger);
    const roleArn = `arn:aws:iam::${ accountId }:role/${ lakeRoleSessionName }`;
    const stsInput = {
      RoleArn: roleArn,
      RoleSessionName: lakeRoleSessionName
    };

    const response = await awsSts.getRoleCredentials(lakeRoleSessionName, accountId);

    expect(assumeRoleMock).toHaveBeenCalledTimes(1);
    expect(sts.assumeRole).toHaveBeenCalledTimes(1);
    expect(sts.assumeRole).toHaveBeenCalledWith(stsInput);
    expect(Credentials).toHaveBeenCalledTimes(1);
    expect(Credentials).toHaveBeenCalledWith({
      accessKeyId: assumeRoleOutput.Credentials.AccessKeyId,
      secretAccessKey: assumeRoleOutput.Credentials.SecretAccessKey,
      sessionToken: assumeRoleOutput.Credentials.SessionToken
    });
    expect(response).toEqual(getMockObject(Credentials).mock.instances[0]);
  });
});
