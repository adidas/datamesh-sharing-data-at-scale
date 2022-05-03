import { Logger } from '@adidas-data-mesh/common';
import { LakeFormation } from 'aws-sdk';
import {
  LakeFormationTag, AwsLakeFormation
} from '../../../../src/data/aws-lake-formation';

jest.mock('aws-sdk', () => ({ LakeFormation: jest.fn() }));

const logger = Logger.silent();

const lakeFormation: any = {};
const deleteLFTagMock = jest.fn(async () => Promise.resolve());
const createLFTagMock = jest.fn(async () => Promise.resolve());
const updateLFTagMock = jest.fn(async () => Promise.resolve());
const lakeFormationTag: LakeFormationTag = {
  TagKey: 'tagKey',
  TagValues: [ 'tagValue' ]
};

describe('# AwsLakeFormation', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    lakeFormation.deleteLFTag = jest.fn(() => ({ promise: deleteLFTagMock }));
    lakeFormation.createLFTag = jest.fn(() => ({ promise: createLFTagMock }));
    lakeFormation.updateLFTag = jest.fn(() => ({ promise: updateLFTagMock }));
  });

  it('Should deleteLFTag successfully', async () => {
    const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
    const awsLakeFormationInput = lakeFormationTag.TagKey;

    await awsLakeFormation.deleteLFTag(awsLakeFormationInput);

    expect(deleteLFTagMock).toHaveBeenCalledTimes(1);
    expect(lakeFormation.deleteLFTag).toHaveBeenCalledTimes(1);
    expect(lakeFormation.deleteLFTag).toHaveBeenCalledWith({
      TagKey: awsLakeFormationInput
    });
  });

  it('Should createLFTag successfully', async () => {
    const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
    const awsLakeFormationInput = lakeFormationTag;

    await awsLakeFormation.createLFTag(awsLakeFormationInput);

    expect(createLFTagMock).toHaveBeenCalledTimes(1);
    expect(lakeFormation.createLFTag).toHaveBeenCalledTimes(1);
    expect(lakeFormation.createLFTag).toHaveBeenCalledWith(awsLakeFormationInput);
  });

  it('Should updateLFTag successfully', async () => {
    const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
    const lakeFormationTagOldValues = [ 'oldValue' ];

    await awsLakeFormation.updateLFTag(lakeFormationTag.TagKey, lakeFormationTagOldValues, lakeFormationTag.TagValues);

    expect(updateLFTagMock).toHaveBeenCalledTimes(1);
    expect(lakeFormation.updateLFTag).toHaveBeenCalledTimes(1);
    expect(lakeFormation.updateLFTag).toHaveBeenCalledWith({
      TagKey: lakeFormationTag.TagKey,
      TagValuesToAdd: lakeFormationTag.TagValues,
      TagValuesToDelete: lakeFormationTagOldValues
    });
  });

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
