import { Logger } from '@adidas-data-mesh/common';
import {
  CloudFormationCustomResourceCreateEvent, CloudFormationCustomResourceDeleteEvent,
  CloudFormationCustomResourceEventCommon, CloudFormationCustomResourceUpdateEvent
} from 'aws-lambda';
import { LakeFormationTag } from '../../../src/data/aws-lake-formation';
import { Domain } from '../../../src/domain';

const logger = Logger.silent();

const tag: LakeFormationTag = {
  TagKey: 'TagKey',
  TagValues: [ 'TagValue' ]
};
const fakeEvent: CloudFormationCustomResourceEventCommon = {
  ServiceToken: '',
  ResponseURL: '',
  StackId: '',
  RequestId: '',
  LogicalResourceId: '',
  ResourceType: '',
  ResourceProperties: {
    ServiceToken: '',
    Tag: tag
  }
};
const newCredentials = {
  accessKeyId: 'accessKeyId',
  secretAccessKey: 'secretAccessKey',
  sessionToken: 'sessionToken'
};
const awsSts: any = {};
const awsLakeFormation: any = {};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsSts.getRoleCredentials = jest.fn(async () => Promise.resolve(newCredentials));
    awsLakeFormation.withNewCredentials = jest.fn(async () => Promise.resolve(awsLakeFormation));
    awsLakeFormation.deleteLFTag = jest.fn(async () => Promise.resolve());
    awsLakeFormation.createLFTag = jest.fn(async () => Promise.resolve());
    awsLakeFormation.updateLFTag = jest.fn(async () => Promise.resolve());
  });

  it('Should call lakeFormation deleteLFTag successfully', async () => {
    const domain = new Domain({ awsSts, awsLakeFormation, logger });
    const deleteInput: CloudFormationCustomResourceDeleteEvent = {
      ...fakeEvent,
      PhysicalResourceId: 'TagKey',
      RequestType: 'Delete'
    };

    const response = await domain.deleteLFTag(deleteInput);

    expect(awsSts.getRoleCredentials).toHaveBeenCalledTimes(1);
    expect(awsSts.getRoleCredentials).toHaveBeenCalledWith();
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledWith(newCredentials);
    expect(awsLakeFormation.deleteLFTag).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.deleteLFTag).toHaveBeenCalledWith(deleteInput.PhysicalResourceId);
    expect(response).toEqual(deleteInput.PhysicalResourceId);
  });

  it('Should call lakeFormation createLFTag successfully', async () => {
    const domain = new Domain({ awsSts, awsLakeFormation, logger });
    const createInput: CloudFormationCustomResourceCreateEvent = {
      ...fakeEvent,
      RequestType: 'Create'
    };

    const response = await domain.createLFTag(createInput);

    expect(awsSts.getRoleCredentials).toHaveBeenCalledTimes(1);
    expect(awsSts.getRoleCredentials).toHaveBeenCalledWith();
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledWith(newCredentials);
    expect(awsLakeFormation.createLFTag).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.createLFTag).toHaveBeenCalledWith(createInput.ResourceProperties.Tag);
    expect(response).toEqual(createInput.ResourceProperties.Tag.TagKey);
  });

  it('Should call lakeFormation createLFTag successfully', async () => {
    const domain = new Domain({ awsSts, awsLakeFormation, logger });
    const oldTag: LakeFormationTag = {
      TagKey: 'TagKey',
      TagValues: [ 'OldValue' ]
    };
    const updateInput: CloudFormationCustomResourceUpdateEvent = {
      ...fakeEvent,
      PhysicalResourceId: 'TagKey',
      RequestType: 'Update',
      OldResourceProperties: {
        Tag: oldTag
      }
    };

    const response = await domain.updateLFTag(updateInput);

    expect(awsSts.getRoleCredentials).toHaveBeenCalledTimes(1);
    expect(awsSts.getRoleCredentials).toHaveBeenCalledWith();
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledWith(newCredentials);
    expect(awsLakeFormation.updateLFTag).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.updateLFTag).toHaveBeenCalledWith(
      updateInput.PhysicalResourceId,
      updateInput.OldResourceProperties.Tag.TagValues,
      updateInput.ResourceProperties.Tag.TagValues
    );
    expect(response).toEqual(updateInput.ResourceProperties.Tag.TagKey);
  });
});
