import { Logger } from '@adidas-data-mesh/common';
import { LakeFormation } from 'aws-sdk';
import { AwsLakeFormation } from '../../../../src/data/aws-lake-formation';

const logger = Logger.silent();

const s3LocationArn = 's3LocationArn';
const dataLakePrincipalIdentifier = 'dataLakePrincipalIdentifier';
const accountId = 'centralAccountId';
const lakeRoleSessionName = 'lakeRoleSessionName';
const roleArn = `arn:aws:iam::${ accountId }:role/${ lakeRoleSessionName }`;
const lakeFormation: any = {};
const registerResourceMock = jest.fn(async () => Promise.resolve());
const grantPermissionsMock = jest.fn(async () => Promise.resolve());

jest.mock('aws-sdk', () => ({ LakeFormation: jest.fn() }));

describe('# AwsLakeFormation', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    lakeFormation.registerResource = jest.fn(() => ({ promise: registerResourceMock }));
    lakeFormation.grantPermissions = jest.fn(() => ({ promise: grantPermissionsMock }));
  });

  describe('registerResource()', () => {
    it('Should registerResource successfully', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);

      await awsLakeFormation.registerResource(s3LocationArn, roleArn);

      expect(registerResourceMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.registerResource).toHaveBeenCalledTimes(1);
      expect(lakeFormation.registerResource).toHaveBeenCalledWith({
        ResourceArn: s3LocationArn,
        RoleArn: roleArn
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');

      registerResourceMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsLakeFormation.registerResource(s3LocationArn, roleArn))
        .rejects.toThrow(unexpectedError);
      expect(registerResourceMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.registerResource).toHaveBeenCalledTimes(1);
      expect(lakeFormation.registerResource).toHaveBeenCalledWith({
        ResourceArn: s3LocationArn,
        RoleArn: roleArn
      });
    });
  });

  describe('grantLocationAccess()', () => {
    it('Should grantLocationAccess successfully', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);

      await awsLakeFormation.grantLocationAccess(s3LocationArn, dataLakePrincipalIdentifier);

      expect(grantPermissionsMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: dataLakePrincipalIdentifier
        },
        Resource: {
          DataLocation: {
            ResourceArn: s3LocationArn
          }
        },
        Permissions: [ 'DATA_LOCATION_ACCESS' ]
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');

      grantPermissionsMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsLakeFormation.grantLocationAccess(s3LocationArn, dataLakePrincipalIdentifier))
        .rejects.toThrow(unexpectedError);
      expect(grantPermissionsMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: dataLakePrincipalIdentifier
        },
        Resource: {
          DataLocation: {
            ResourceArn: s3LocationArn
          }
        },
        Permissions: [ 'DATA_LOCATION_ACCESS' ]
      });
    });
  });

  describe('withNewCredentials()', () => {
    it('Should withNewCredentials successfully', (done) => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const newCredentials: any = {
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        sessionToken: 'sessionToken'
      };

      awsLakeFormation.withNewCredentials(newCredentials);

      expect(LakeFormation).toHaveBeenCalledTimes(1);
      expect(LakeFormation).toHaveBeenCalledWith({
        credentials: newCredentials
      });

      done();
    });
  });
});
