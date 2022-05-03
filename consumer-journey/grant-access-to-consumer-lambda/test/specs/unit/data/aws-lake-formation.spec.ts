import { Logger } from '@adidas-data-mesh/common';
import { LakeFormation } from 'aws-sdk';
import { AwsLakeFormation } from '../../../../src/data/aws-lake-formation';
import {
  DataProductLFTagValues, CommonLFTagKeys,
  PciLFTagValues, PiiLFTagValues
} from '../../../../src/lf-tags.model';

const logger = Logger.silent();

const accountId = '123456789123';
const dataProductName = 'dataProductName';
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

      await awsLakeFormation.grantDatabasePermissions(dataProductName, accountId);

      expect(grantPermissionsMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: accountId
        },
        Resource: {
          LFTagPolicy: {
            ResourceType: 'DATABASE',
            Expression: [
              {
                TagKey: dataProductName,
                TagValues: [ DataProductLFTagValues.access ]
              },
              {
                TagKey: CommonLFTagKeys.pci,
                TagValues: [ PciLFTagValues.false ]
              },
              {
                TagKey: CommonLFTagKeys.pii,
                TagValues: [ PiiLFTagValues.false ]
              }
            ]
          }
        },
        Permissions: listOfPermissions,
        PermissionsWithGrantOption: listOfPermissions
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const listOfPermissions = [ 'DESCRIBE' ];
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');

      grantPermissionsMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsLakeFormation.grantDatabasePermissions(dataProductName, accountId))
        .rejects.toThrow(unexpectedError);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: accountId
        },
        Resource: {
          LFTagPolicy: {
            ResourceType: 'DATABASE',
            Expression: [
              {
                TagKey: dataProductName,
                TagValues: [ DataProductLFTagValues.access ]
              },
              {
                TagKey: CommonLFTagKeys.pci,
                TagValues: [ PciLFTagValues.false ]
              },
              {
                TagKey: CommonLFTagKeys.pii,
                TagValues: [ PiiLFTagValues.false ]
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
      const listOfPermissions = [ 'DESCRIBE', 'SELECT' ];
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);

      await awsLakeFormation.grantTablePermissions(dataProductName, accountId);

      expect(grantPermissionsMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: accountId
        },
        Resource: {
          LFTagPolicy: {
            ResourceType: 'TABLE',
            Expression: [
              {
                TagKey: dataProductName,
                TagValues: [ DataProductLFTagValues.access ]
              },
              {
                TagKey: CommonLFTagKeys.pci,
                TagValues: [ PciLFTagValues.false ]
              },
              {
                TagKey: CommonLFTagKeys.pii,
                TagValues: [ PiiLFTagValues.false ]
              }
            ]
          }
        },
        Permissions: listOfPermissions,
        PermissionsWithGrantOption: listOfPermissions
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const listOfPermissions = [ 'DESCRIBE', 'SELECT' ];
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');

      grantPermissionsMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsLakeFormation.grantTablePermissions(dataProductName, accountId))
        .rejects.toThrow(unexpectedError);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledTimes(1);
      expect(lakeFormation.grantPermissions).toHaveBeenCalledWith({
        Principal: {
          DataLakePrincipalIdentifier: accountId
        },
        Resource: {
          LFTagPolicy: {
            ResourceType: 'TABLE',
            Expression: [
              {
                TagKey: dataProductName,
                TagValues: [ DataProductLFTagValues.access ]
              },
              {
                TagKey: CommonLFTagKeys.pci,
                TagValues: [ PciLFTagValues.false ]
              },
              {
                TagKey: CommonLFTagKeys.pii,
                TagValues: [ PiiLFTagValues.false ]
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
