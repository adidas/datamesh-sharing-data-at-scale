import { Logger } from '@adidas-data-mesh/common';
import { LakeFormation } from 'aws-sdk';
import { AwsLakeFormation } from '../../../../src/data/aws-lake-formation';
import { DataProductLFTagValues } from '../../../../src/lf-tags.model';

const logger = Logger.silent();

const dataProductLFTagValues = Object.values(DataProductLFTagValues);
const dataProductTag = {
  TagKey: 'TagKey',
  TagValues: dataProductLFTagValues
};
const lakeFormation: any = {};
const createLFTagMock = jest.fn(async () => Promise.resolve());

jest.mock('aws-sdk', () => ({ LakeFormation: jest.fn() }));

describe('# AwsLakeFormation', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    lakeFormation.createLFTag = jest.fn(() => ({ promise: createLFTagMock }));
  });

  describe('createDataProductTag()', () => {
    it('Should createDataProductTag successfully', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);

      await awsLakeFormation.createDataProductTag(dataProductTag);

      expect(createLFTagMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.createLFTag).toHaveBeenCalledTimes(1);
      expect(lakeFormation.createLFTag).toHaveBeenCalledWith(dataProductTag);
    });

    it('Should throw an error since aws has failed', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');

      createLFTagMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsLakeFormation.createDataProductTag(dataProductTag))
        .rejects.toThrow(unexpectedError);
      expect(createLFTagMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.createLFTag).toHaveBeenCalledTimes(1);
      expect(lakeFormation.createLFTag).toHaveBeenCalledWith(dataProductTag);
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
