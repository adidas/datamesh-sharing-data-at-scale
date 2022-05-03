import { Logger } from '@adidas-data-mesh/common';
import { Domain } from '../../../src/domain';
import {
  DataProductLFTagValues, pciLFTag, PciLFTagValues, piiLFTag,
  PiiLFTagValues, visibilityLFTag, VisibilityLFTagValues
} from '../../../src/lf-tags.model';

const logger = Logger.silent();

const lakeRoleSessionName = 'lakeRoleSessionName';
const accountId = 'accountId';
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
const newCredentials = {
  accessKeyId: 'accessKeyId',
  secretAccessKey: 'secretAccessKey',
  sessionToken: 'sessionToken'
};
const awsLakeFormation: any = {};
const awsSts: any = {};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsSts.getRoleCredentials = jest.fn(async () => Promise.resolve(newCredentials));
    awsLakeFormation.withNewCredentials = jest.fn().mockResolvedValue(awsLakeFormation);
    awsLakeFormation.addLFTagsToResource = jest.fn().mockResolvedValue({});
  });

  it('Should assume the producer role for awsLakeFormation', async () => {
    const domain = new Domain({ awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });

    await domain.execute(databaseName, dataProductName);

    expect(awsSts.getRoleCredentials).toHaveBeenCalledTimes(1);
    expect(awsSts.getRoleCredentials).toHaveBeenCalledWith(lakeRoleSessionName, accountId);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledWith(newCredentials);
  });

  it('Should execute the domain successfully', async () => {
    const domain = new Domain({ awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });

    await domain.execute(databaseName, dataProductName);

    expect(awsLakeFormation.addLFTagsToResource).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.addLFTagsToResource).toHaveBeenCalledWith(databaseName, defaultLFTags);
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });
    const unexpectedError = new Error('There has been an error');

    awsLakeFormation.addLFTagsToResource = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(databaseName, dataProductName))
        .rejects.toThrow(unexpectedError);
    expect(awsLakeFormation.addLFTagsToResource).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.addLFTagsToResource).toHaveBeenCalledWith(databaseName, defaultLFTags);
  });
});
