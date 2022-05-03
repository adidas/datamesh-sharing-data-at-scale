import { Logger } from '@adidas-data-mesh/common';
import {
  CloudFormationCustomResourceCreateEvent, CloudFormationCustomResourceDeleteEvent,
  CloudFormationCustomResourceUpdateEvent
} from 'aws-lambda';
import { Handler } from '../../../src/handler';
import {
  CustomResourceStatus, getCustomResourceResponse, RESOURCE_NOT_CREATED, sendCustomResourceResponse
} from '../../../src/utils/custom-resource';

const logger = Logger.silent().withTag('Handler');

const domain: any = {};
const context: any = {};
const physicalResourceId = 'physicalResourceId';
const cfnCustomResourceCreateEvent: CloudFormationCustomResourceCreateEvent = {
  ServiceToken: 'ServiceToken',
  ResponseURL: 'ResponseURL',
  StackId: 'StackId',
  RequestType: 'Create',
  RequestId: 'RequestId',
  LogicalResourceId: 'LogicalResourceId',
  ResourceType: 'ResourceType',
  ResourceProperties: {
    ServiceToken: 'ServiceToken'
  }
};
const cfnCustomResourceUpdateEvent: CloudFormationCustomResourceUpdateEvent = {
  ServiceToken: 'ServiceToken',
  ResponseURL: 'ResponseURL',
  StackId: 'StackId',
  RequestType: 'Update',
  RequestId: 'RequestId',
  LogicalResourceId: 'LogicalResourceId',
  ResourceType: 'ResourceType',
  PhysicalResourceId: physicalResourceId,
  ResourceProperties: {
    ServiceToken: 'ServiceToken'
  },
  OldResourceProperties: {}
};
const cfnCustomResourceDeleteEvent: CloudFormationCustomResourceDeleteEvent = {
  ServiceToken: 'ServiceToken',
  ResponseURL: 'ResponseURL',
  StackId: 'StackId',
  RequestType: 'Delete',
  RequestId: 'RequestId',
  LogicalResourceId: 'LogicalResourceId',
  ResourceType: 'ResourceType',
  PhysicalResourceId: physicalResourceId,
  ResourceProperties: {
    ServiceToken: 'ServiceToken'
  }
};
const sendCustomResourceResponseMock = jest.fn().mockResolvedValue({});

jest.mock('../../../src/utils/custom-resource', () => ({
  ...jest.requireActual('../../../src/utils/custom-resource'),
  sendCustomResourceResponse: jest.fn(() => sendCustomResourceResponseMock)
}));

describe('# Handler', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    domain.createDataProductAsset = jest.fn(async () => Promise.resolve(physicalResourceId));
    domain.updateDataProductAsset = jest.fn(async () => Promise.resolve(physicalResourceId));
    domain.deleteDataProductAsset = jest.fn(async () => Promise.resolve(physicalResourceId));
  });

  it('Should execute the handler successfully a CreateEvent', async () => {
    const handler = new Handler(domain, logger);
    const executeInput = {
      ...cfnCustomResourceCreateEvent
    };
    const domainInput = executeInput;
    const response = getCustomResourceResponse(context)({
      event: executeInput,
      status: CustomResourceStatus.success,
      physicalResourceId
    }, logger);

    await handler.execute(executeInput, context);

    expect(sendCustomResourceResponse).toHaveBeenCalledTimes(1);
    expect(sendCustomResourceResponse).toHaveBeenCalledWith(executeInput);
    expect(sendCustomResourceResponseMock).toHaveBeenCalledTimes(1);
    expect(sendCustomResourceResponseMock).toHaveBeenCalledWith(response, logger);
    expect(domain.createDataProductAsset).toHaveBeenCalledTimes(1);
    expect(domain.createDataProductAsset).toHaveBeenCalledWith(domainInput);
  });

  it('Should execute the handler successfully a UpdateEvent', async () => {
    const handler = new Handler(domain, logger);
    const executeInput = {
      ...cfnCustomResourceUpdateEvent
    };
    const domainInput = executeInput;
    const response = getCustomResourceResponse(context)({
      event: executeInput,
      status: CustomResourceStatus.success,
      physicalResourceId
    }, logger);

    await handler.execute(executeInput, context);

    expect(sendCustomResourceResponse).toHaveBeenCalledTimes(1);
    expect(sendCustomResourceResponse).toHaveBeenCalledWith(executeInput);
    expect(sendCustomResourceResponseMock).toHaveBeenCalledTimes(1);
    expect(sendCustomResourceResponseMock).toHaveBeenCalledWith(response, logger);
    expect(domain.updateDataProductAsset).toHaveBeenCalledTimes(1);
    expect(domain.updateDataProductAsset).toHaveBeenCalledWith(domainInput);
  });

  it('Should execute the handler successfully a DeleteEvent', async () => {
    const handler = new Handler(domain, logger);
    const executeInput = {
      ...cfnCustomResourceDeleteEvent
    };
    const domainInput = executeInput;
    const response = getCustomResourceResponse(context)({
      event: executeInput,
      status: CustomResourceStatus.success,
      physicalResourceId
    }, logger);

    await handler.execute(executeInput, context);

    expect(sendCustomResourceResponse).toHaveBeenCalledTimes(1);
    expect(sendCustomResourceResponse).toHaveBeenCalledWith(executeInput);
    expect(sendCustomResourceResponseMock).toHaveBeenCalledTimes(1);
    expect(sendCustomResourceResponseMock).toHaveBeenCalledWith(response, logger);
    expect(domain.deleteDataProductAsset).toHaveBeenCalledTimes(1);
    expect(domain.deleteDataProductAsset).toHaveBeenCalledWith(domainInput);
  });

  it('Should execute the handler successfully a resource not created event', async () => {
    const handler = new Handler(domain, logger);
    const executeInput = {
      ...cfnCustomResourceCreateEvent,
      PhysicalResourceId: RESOURCE_NOT_CREATED
    };
    const response = getCustomResourceResponse(context)({
      event: executeInput,
      status: CustomResourceStatus.success,
      physicalResourceId: RESOURCE_NOT_CREATED
    }, logger);

    await handler.execute(executeInput, context);

    expect(sendCustomResourceResponse).toHaveBeenCalledTimes(1);
    expect(sendCustomResourceResponse).toHaveBeenCalledWith(executeInput);
    expect(sendCustomResourceResponseMock).toHaveBeenCalledTimes(1);
    expect(sendCustomResourceResponseMock).toHaveBeenCalledWith(response, logger);
    expect(domain.createDataProductAsset).toHaveBeenCalledTimes(0);
    expect(domain.updateDataProductAsset).toHaveBeenCalledTimes(0);
    expect(domain.deleteDataProductAsset).toHaveBeenCalledTimes(0);
  });

  it('Should execute the handler successfully an unknown event', async () => {
    const handler = new Handler(domain, logger);
    const executeInput: any = {
      ...cfnCustomResourceCreateEvent,
      RequestType: 'fake'
    };
    const response = getCustomResourceResponse(context)({
      event: executeInput,
      status: CustomResourceStatus.success,
      physicalResourceId: ''
    }, logger);

    await handler.execute(executeInput, context);

    expect(sendCustomResourceResponse).toHaveBeenCalledTimes(1);
    expect(sendCustomResourceResponse).toHaveBeenCalledWith(executeInput);
    expect(sendCustomResourceResponseMock).toHaveBeenCalledTimes(1);
    expect(sendCustomResourceResponseMock).toHaveBeenCalledWith(response, logger);
    expect(domain.createDataProductAsset).toHaveBeenCalledTimes(0);
    expect(domain.updateDataProductAsset).toHaveBeenCalledTimes(0);
    expect(domain.deleteDataProductAsset).toHaveBeenCalledTimes(0);
  });

  it('Should return an error since domain has failed', async () => {
    const handler = new Handler(domain, logger);
    const unexpectedError = new Error('Unexpected error');
    const executeInput = {
      ...cfnCustomResourceCreateEvent
    };
    const domainInput = executeInput;
    const response = getCustomResourceResponse(context)({
      event: executeInput,
      status: CustomResourceStatus.failed,
      reason: JSON.stringify(unexpectedError),
      physicalResourceId: RESOURCE_NOT_CREATED
    }, logger);

    domain.createDataProductAsset = jest.fn(async () => Promise.reject(unexpectedError));

    await handler.execute(executeInput, context);

    expect(sendCustomResourceResponse).toHaveBeenCalledTimes(1);
    expect(sendCustomResourceResponse).toHaveBeenCalledWith(executeInput);
    expect(sendCustomResourceResponseMock).toHaveBeenCalledTimes(1);
    expect(sendCustomResourceResponseMock).toHaveBeenCalledWith(response, logger);
    expect(domain.createDataProductAsset).toHaveBeenCalledTimes(1);
    expect(domain.createDataProductAsset).toHaveBeenCalledWith(domainInput);
  });
});
