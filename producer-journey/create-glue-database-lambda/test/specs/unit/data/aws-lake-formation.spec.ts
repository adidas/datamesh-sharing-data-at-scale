import { Logger } from '@adidas-data-mesh/common';
import { LakeFormation } from 'aws-sdk';
import { AwsLakeFormation } from '../../../../src/data/aws-lake-formation';

const logger = Logger.silent();

const glueDatabaseName = 'glueDatabaseName';
const lakeFormation: any = {};
const revokePermissionsMock = jest.fn(async () => Promise.resolve());

jest.mock('aws-sdk', () => ({ LakeFormation: jest.fn() }));

describe('# AwsLakeFormation', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    lakeFormation.revokePermissions = jest.fn(() => ({ promise: revokePermissionsMock }));
  });

  describe('disableIamControlAccess()', () => {
    it('Should disableIamControlAccess successfully', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);

      await awsLakeFormation.disableIamControlAccess(glueDatabaseName);

      expect(revokePermissionsMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.revokePermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.revokePermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: 'IAM_ALLOWED_PRINCIPALS'
        },
        Resource: {
          Database: {
            Name: glueDatabaseName
          }
        },
        Permissions: [ 'ALL' ]
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');

      revokePermissionsMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsLakeFormation.disableIamControlAccess(glueDatabaseName))
        .rejects.toThrow(unexpectedError);
      expect(revokePermissionsMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.revokePermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.revokePermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: 'IAM_ALLOWED_PRINCIPALS'
        },
        Resource: {
          Database: {
            Name: glueDatabaseName
          }
        },
        Permissions: [ 'ALL' ]
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
