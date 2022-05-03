import { Logger } from '@adidas-data-mesh/common';
import { LakeFormation } from 'aws-sdk';
import { AwsLakeFormation } from '../../../../src/data/aws-lake-formation';
import { DataProductLFTagValues } from '../../../../src/lf-tags.model';

const logger = Logger.silent();

const dataProductLFTagName = 'dataProductLFTagName';
const producerAccountId = 'producerAccountId';
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
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const listOfPermissions = [ 'CREATE_TABLE' ];

      await awsLakeFormation.grantDatabasePermissions(dataProductLFTagName, producerAccountId);

      expect(grantPermissionsMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: producerAccountId
        },
        Resource: {
          LFTagPolicy: {
            ResourceType: 'DATABASE',
            Expression: [
              {
                TagKey: dataProductLFTagName,
                TagValues: [ DataProductLFTagValues.access ]
              }
            ]
          }
        },
        Permissions: listOfPermissions,
        PermissionsWithGrantOption: listOfPermissions
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');
      const listOfPermissions = [ 'CREATE_TABLE' ];

      grantPermissionsMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsLakeFormation.grantDatabasePermissions(dataProductLFTagName, producerAccountId))
        .rejects.toThrow(unexpectedError);
      expect(grantPermissionsMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: producerAccountId
        },
        Resource: {
          LFTagPolicy: {
            ResourceType: 'DATABASE',
            Expression: [
              {
                TagKey: dataProductLFTagName,
                TagValues: [ DataProductLFTagValues.access ]
              }
            ]
          }
        },
        Permissions: listOfPermissions,
        PermissionsWithGrantOption: listOfPermissions
      });
    });
  });

  describe('grantTablePermissions()', () => {
    it('Should grantTablePermissions successfully', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const listOfPermissions = [ 'SELECT', 'ALTER', 'DELETE', 'INSERT', 'DESCRIBE' ];

      await awsLakeFormation.grantTablePermissions(dataProductLFTagName, producerAccountId);

      expect(grantPermissionsMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: producerAccountId
        },
        Resource: {
          LFTagPolicy: {
            ResourceType: 'TABLE',
            Expression: [
              {
                TagKey: dataProductLFTagName,
                TagValues: [ DataProductLFTagValues.access ]
              }
            ]
          }
        },
        Permissions: listOfPermissions,
        PermissionsWithGrantOption: listOfPermissions
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');
      const listOfPermissions = [ 'SELECT', 'ALTER', 'DELETE', 'INSERT', 'DESCRIBE' ];

      grantPermissionsMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsLakeFormation.grantTablePermissions(dataProductLFTagName, producerAccountId))
        .rejects.toThrow(unexpectedError);
      expect(grantPermissionsMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: producerAccountId
        },
        Resource: {
          LFTagPolicy: {
            ResourceType: 'TABLE',
            Expression: [
              {
                TagKey: dataProductLFTagName,
                TagValues: [ DataProductLFTagValues.access ]
              }
            ]
          }
        },
        Permissions: listOfPermissions,
        PermissionsWithGrantOption: listOfPermissions
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
