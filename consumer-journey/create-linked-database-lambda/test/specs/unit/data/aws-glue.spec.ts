import { Logger } from '@adidas-data-mesh/common';
import { Glue } from 'aws-sdk';
import { AwsGlue } from '../../../../src/data/aws-glue';

const logger = Logger.silent();

const glueDatabaseName = 'glueDatabaseName';
const accountId = 'accountId';

const createDatabaseMock = jest.fn(async () => Promise.resolve());
const glue: any = {};

jest.mock('aws-sdk', () => ({ Glue: jest.fn() }));

describe('# AwsGlue', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    glue.createDatabase = jest.fn(() => ({ promise: createDatabaseMock }));
  });

  describe('createLinkedDatabase()', () => {
    it('Should createLinkedDatabase successfully', async () => {
      const awsGlue = new AwsGlue(glue, accountId, logger);

      await awsGlue.createLinkedDatabase(glueDatabaseName);

      expect(createDatabaseMock).toHaveBeenCalledTimes(1);
      expect(glue.createDatabase).toHaveBeenCalledTimes(1);
      expect(glue.createDatabase).toHaveBeenCalledWith({
        DatabaseInput: {
          Name: glueDatabaseName,
          TargetDatabase: {
            DatabaseName: glueDatabaseName,
            CatalogId: accountId
          }
        }
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const awsGlue = new AwsGlue(glue, accountId, logger);
      const unexpectedError = new Error('There has been an error');

      createDatabaseMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsGlue.createLinkedDatabase(glueDatabaseName))
        .rejects.toThrow(unexpectedError);
      expect(createDatabaseMock).toHaveBeenCalledTimes(1);
      expect(glue.createDatabase).toHaveBeenCalledTimes(1);
      expect(glue.createDatabase).toHaveBeenCalledWith({
        DatabaseInput: {
          Name: glueDatabaseName,
          TargetDatabase: {
            DatabaseName: glueDatabaseName,
            CatalogId: accountId
          }
        }
      });
    });
  });

  describe('withNewCredentials()', () => {
    it('Should withNewCredentials successfully', (done) => {
      const awsGlue = new AwsGlue(glue, accountId, logger);
      const newCredentials: any = {
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        sessionToken: 'sessionToken'
      };

      awsGlue.withNewCredentials(newCredentials);

      expect(Glue).toHaveBeenCalledTimes(1);
      expect(Glue).toHaveBeenCalledWith({
        credentials: newCredentials
      });

      done();
    });
  });
});
