import { Logger } from '@adidas-data-mesh/common';
import { LakeFormation } from 'aws-sdk';
import { AwsLakeFormation } from '../../../../src/data/aws-lake-formation';
import {
  DataProductLFTagValues, visibilityLFTag, VisibilityLFTagValues,
  pciLFTag, PciLFTagValues, piiLFTag, PiiLFTagValues
} from '../../../../src/lf-tags.model';

const logger = Logger.silent();

const databaseName = 'databaseName';
const dataProductName = 'dataProductName';
const defaultLFTags = [
  {
    TagKey: dataProductName,
    TagValues: [ DataProductLFTagValues.access ]
  },
  {
    TagKey: visibilityLFTag.TagKey,
    TagValues: [ VisibilityLFTagValues.public ]
  },
  {
    TagKey: pciLFTag.TagKey,
    TagValues: [ PciLFTagValues.false ]
  },
  {
    TagKey: piiLFTag.TagKey,
    TagValues: [ PiiLFTagValues.false ]
  }
];
const lakeFormation: any = {};
const addLFTagsToResourceMock = jest.fn(async () => Promise.resolve());

jest.mock('aws-sdk', () => ({ LakeFormation: jest.fn() }));

describe('# AwsLakeFormation', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    lakeFormation.addLFTagsToResource = jest.fn(() => ({ promise: addLFTagsToResourceMock }));
  });

  describe('addLFTagsToResource()', () => {
    it('Should addLFTagsToResource successfully', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);

      await awsLakeFormation.addLFTagsToResource(databaseName, defaultLFTags);

      expect(addLFTagsToResourceMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.addLFTagsToResource).toHaveBeenCalledTimes(1);
      expect(lakeFormation.addLFTagsToResource).toHaveBeenCalledWith({
        Resource: {
          Database: {
            Name: databaseName
          }
        },
        LFTags: defaultLFTags
      });
    });

    it('Should throw an error since aws has failed', async () => {
      const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
      const unexpectedError = new Error('There has been an error');

      addLFTagsToResourceMock.mockRejectedValue(unexpectedError);

      await expect(async () => awsLakeFormation.addLFTagsToResource(databaseName, defaultLFTags))
        .rejects.toThrow(unexpectedError);
      expect(addLFTagsToResourceMock).toHaveBeenCalledTimes(1);
      expect(lakeFormation.addLFTagsToResource).toHaveBeenCalledTimes(1);
      expect(lakeFormation.addLFTagsToResource).toHaveBeenCalledWith({
        Resource: {
          Database: {
            Name: databaseName
          }
        },
        LFTags: defaultLFTags
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
