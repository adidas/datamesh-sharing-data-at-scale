import { Logger } from '@adidas-data-mesh/common';
import { LakeFormation } from 'aws-sdk';
import {
  AddLFTagsToTableColumnsConfig, AddVisibilityLFTagToTableConfig, AwsLakeFormation
} from '../../../../src/data/aws-lake-formation';

const logger = Logger.silent();

const databaseName = 'databaseName';
const tableName = 'tableName';
const addVisibilityLFTagToTableConfig: AddVisibilityLFTagToTableConfig = {
  databaseName,
  tableName,
  visibility: 'internal'
};
const addLFTagsToTableColumnsConfig: AddLFTagsToTableColumnsConfig = {
  databaseName,
  tableName,
  columnName: 'columnName',
  columnTagKey: 'pci',
  columnTagValue: true
};
const lakeFormation: any = {};
const addLFTagsToResourceMock = jest.fn(async () => Promise.resolve());

jest.mock('aws-sdk', () => ({ LakeFormation: jest.fn() }));

describe('# AwsLakeFormation', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    lakeFormation.addLFTagsToResource = jest.fn(() => ({ promise: addLFTagsToResourceMock }));
  });

  describe('addVisibilityLFTagToTable()', () => {
    it('Should addVisibilityLFTagToTable successfully', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);

      await awsLakeFormation.addVisibilityLFTagToTable(addVisibilityLFTagToTableConfig);

      expect(addLFTagsToResourceMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.addLFTagsToResource).toHaveBeenCalledTimes(1);
      expect(lakeFormation.addLFTagsToResource).toHaveBeenCalledWith({
        LFTags: [
          {
            TagKey: 'visibility',
            TagValues: [ addVisibilityLFTagToTableConfig.visibility ]
          }
        ],
        Resource: {
          Table: {
            DatabaseName: databaseName,
            Name: tableName
          }
        }
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');

      addLFTagsToResourceMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsLakeFormation.addVisibilityLFTagToTable(addVisibilityLFTagToTableConfig))
        .rejects.toThrow(unexpectedError);
      expect(addLFTagsToResourceMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.addLFTagsToResource).toHaveBeenCalledTimes(1);
      expect(lakeFormation.addLFTagsToResource).toHaveBeenCalledWith({
        LFTags: [
          {
            TagKey: 'visibility',
            TagValues: [ addVisibilityLFTagToTableConfig.visibility ]
          }
        ],
        Resource: {
          Table: {
            DatabaseName: databaseName,
            Name: tableName
          }
        }
      });
    });
  });

  describe('addLFTagsToTableColumns()', () => {
    it('Should addLFTagsToTableColumns successfully', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);

      await awsLakeFormation.addLFTagsToTableColumns(addLFTagsToTableColumnsConfig);

      expect(addLFTagsToResourceMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.addLFTagsToResource).toHaveBeenCalledTimes(1);
      expect(lakeFormation.addLFTagsToResource).toHaveBeenCalledWith({
        LFTags: [
          {
            TagKey: addLFTagsToTableColumnsConfig.columnTagKey,
            TagValues: [ `${ addLFTagsToTableColumnsConfig.columnTagValue }` ]
          }
        ],
        Resource: {
          TableWithColumns: {
            DatabaseName: databaseName,
            Name: tableName,
            ColumnNames: [ addLFTagsToTableColumnsConfig.columnName ]
          }
        }
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');

      addLFTagsToResourceMock.mockRejectedValue(unexpectedError);

      await expect(async () => awsLakeFormation.addLFTagsToTableColumns(addLFTagsToTableColumnsConfig))
        .rejects.toThrow(unexpectedError);
      expect(addLFTagsToResourceMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.addLFTagsToResource).toHaveBeenCalledTimes(1);
      expect(lakeFormation.addLFTagsToResource).toHaveBeenCalledWith({
        LFTags: [
          {
            TagKey: addLFTagsToTableColumnsConfig.columnTagKey,
            TagValues: [ `${ addLFTagsToTableColumnsConfig.columnTagValue }` ]
          }
        ],
        Resource: {
          TableWithColumns: {
            DatabaseName: databaseName,
            Name: tableName,
            ColumnNames: [ addLFTagsToTableColumnsConfig.columnName ]
          }
        }
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
