import { Logger } from '@adidas-data-mesh/common';
import { LakeFormation } from 'aws-sdk';
import { AwsLakeFormation } from '../../../../src/data/aws-lake-formation';

const logger = Logger.silent();

const consumerRoleArn = 'consumerRoleArn';
const databaseName = 'databaseName';
const lakeFormation: any = {};
const grantPermissionsMock = jest.fn(async () => Promise.resolve());

jest.mock('aws-sdk', () => ({ LakeFormation: jest.fn() }));

describe('# AwsLakeFormation', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    lakeFormation.grantPermissions = jest.fn(() => ({ promise: grantPermissionsMock }));
  });

  describe('grantDatabasePermissions()', () => {
    it('Should grantDatabasePermissions successfully', async () => {
      const listOfPermissions = [ 'DESCRIBE' ];
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);

      await awsLakeFormation.grantDatabasePermissions(databaseName, consumerRoleArn);

      expect(grantPermissionsMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: consumerRoleArn
        },
        Resource: {
          Database: {
            Name: databaseName
          }
        },
        Permissions: listOfPermissions
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const listOfPermissions = [ 'DESCRIBE' ];
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');

      grantPermissionsMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsLakeFormation.grantDatabasePermissions(databaseName, consumerRoleArn))
        .rejects.toThrow(unexpectedError);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: consumerRoleArn
        },
        Resource: {
          Database: {
            Name: databaseName
          }
        },
        Permissions: listOfPermissions
      });
    });
  });

  describe('grantTablePermissions()', () => {
    it('Should grantTablePermissions successfully', async () => {
      const listOfPermissions = [ 'DESCRIBE', 'SELECT' ];
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);

      await awsLakeFormation.grantTablePermissions(databaseName, consumerRoleArn);

      expect(grantPermissionsMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: consumerRoleArn
        },
        Resource: {
          Table: {
            DatabaseName: databaseName,
            TableWildcard: {}
          }
        },
        Permissions: listOfPermissions
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const listOfPermissions = [ 'DESCRIBE', 'SELECT' ];
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');

      grantPermissionsMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsLakeFormation.grantTablePermissions(databaseName, consumerRoleArn))
        .rejects.toThrow(unexpectedError);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: consumerRoleArn
        },
        Resource: {
          Table: {
            DatabaseName: databaseName,
            TableWildcard: {}
          }
        },
        Permissions: listOfPermissions
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
