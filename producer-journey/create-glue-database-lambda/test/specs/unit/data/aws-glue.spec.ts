import { Logger } from '@adidas-data-mesh/common';
import { Glue } from 'aws-sdk';
import { AwsGlue } from '../../../../src/data/aws-glue';

const logger = Logger.silent();

const glueDatabaseName = 'glueDatabaseName';

const createDatabaseMock = jest.fn(async () => Promise.resolve());
const glue: any = {};

jest.mock('aws-sdk', () => ({ Glue: jest.fn() }));

describe('# AwsGlue', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    glue.createDatabase = jest.fn(() => ({ promise: createDatabaseMock }));
  });

  describe('createLFDatabase()', () => {
    it('Should createLFDatabase successfully', async () => {
      const awsGlue = new AwsGlue(glue, logger);

      await awsGlue.createLFDatabase(glueDatabaseName);

      expect(createDatabaseMock).toHaveBeenCalledTimes(1);
      expect(glue.createDatabase).toHaveBeenCalledTimes(1);
      expect(glue.createDatabase).toHaveBeenCalledWith({
        DatabaseInput: {
          Name: glueDatabaseName,
          CreateTableDefaultPermissions: []
        }
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const awsGlue = new AwsGlue(glue, logger);
      const unexpectedError = new Error('There has been an error');

      createDatabaseMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsGlue.createLFDatabase(glueDatabaseName))
        .rejects.toThrow(unexpectedError);
      expect(createDatabaseMock).toHaveBeenCalledTimes(1);
      expect(glue.createDatabase).toHaveBeenCalledTimes(1);
      expect(glue.createDatabase).toHaveBeenCalledWith({
        DatabaseInput: {
          Name: glueDatabaseName,
          CreateTableDefaultPermissions: []
        }
      });
    });
  });

  describe('createIamDatabase()', () => {
    it('Should createIamDatabase successfully', async () => {
      const awsGlue = new AwsGlue(glue, logger);

      await awsGlue.createIamDatabase(glueDatabaseName);

      expect(createDatabaseMock).toHaveBeenCalledTimes(1);
      expect(glue.createDatabase).toHaveBeenCalledTimes(1);
      expect(glue.createDatabase).toHaveBeenCalledWith({
        DatabaseInput: {
          Name: glueDatabaseName
        }
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const awsGlue = new AwsGlue(glue, logger);
      const unexpectedError = new Error('There has been an error');

      createDatabaseMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsGlue.createIamDatabase(glueDatabaseName))
        .rejects.toThrow(unexpectedError);
      expect(createDatabaseMock).toHaveBeenCalledTimes(1);
      expect(glue.createDatabase).toHaveBeenCalledTimes(1);
      expect(glue.createDatabase).toHaveBeenCalledWith({
        DatabaseInput: {
          Name: glueDatabaseName
        }
      });
    });
  });

  describe('withNewCredentials()', () => {
    it('Should withNewCredentials successfully', (done) => {
      const awsGlue = new AwsGlue(glue, logger);
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
