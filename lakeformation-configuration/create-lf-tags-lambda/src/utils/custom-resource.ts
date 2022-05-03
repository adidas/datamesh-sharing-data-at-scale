import fetch, { Response } from 'node-fetch';
import {
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceEventCommon, Context,
  CloudFormationCustomResourceSuccessResponse, CloudFormationCustomResourceFailedResponse,
  CloudFormationCustomResourceResponse,
  CloudFormationCustomResourceCreateEvent,
  CloudFormationCustomResourceUpdateEvent,
  CloudFormationCustomResourceDeleteEvent
} from 'aws-lambda';
import { Logger } from '@adidas-data-mesh/common';

export enum RequestType {
  create = 'Create',
  update = 'Update',
  delete = 'Delete'
}

export enum CustomResourceStatus {
  success = 'SUCCESS',
  failed = 'FAILED'
}

export const isCreateEvent = (x: CloudFormationCustomResourceEvent): x is CloudFormationCustomResourceCreateEvent =>
  x.RequestType === RequestType.create;

export const isUpdateEvent = (x: CloudFormationCustomResourceEvent): x is CloudFormationCustomResourceUpdateEvent =>
  x.RequestType === RequestType.update;

export const isDeleteEvent = (x: CloudFormationCustomResourceEvent): x is CloudFormationCustomResourceDeleteEvent =>
  x.RequestType === RequestType.delete;

export type SendResponseConfig = {
  event: CloudFormationCustomResourceEventCommon;
  status: CustomResourceStatus;
  reason?: string;
  responseData?: {
    [Key: string]: any;
  };
  physicalResourceId?: string;
  noEcho?: boolean;
};

export const RESOURCE_NOT_CREATED = 'ResourceNotCreated';

export const getCustomResourceResponse = (context: Context) => ({
  event,
  status,
  reason,
  responseData,
  physicalResourceId,
  noEcho = false
}: SendResponseConfig, logger: Logger): CloudFormationCustomResourceResponse => {
  logger.info(`Preparing a Cloudformation response for resource  ${
    event.LogicalResourceId } in stack ${ event.StackId }. Status is  ${ status }`);

  const response: CloudFormationCustomResourceSuccessResponse | CloudFormationCustomResourceFailedResponse = {
    Status: status,
    Reason: reason?.length ? reason : `See the details in CloudWatch Log Stream: ${ context.logStreamName }`,
    PhysicalResourceId: physicalResourceId?.length ? physicalResourceId : RESOURCE_NOT_CREATED,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: responseData,
    NoEcho: noEcho
  };

  return response;
};

export const sendCustomResourceResponse = (event: CloudFormationCustomResourceEventCommon) => async (
    cloudFormationCustomResourceResponse:
    CloudFormationCustomResourceSuccessResponse | CloudFormationCustomResourceFailedResponse,
    logger: Logger
): Promise<void> => {
  const body = JSON.stringify(cloudFormationCustomResourceResponse);

  const options = {
    headers: {
      'Content-Type': 'Application/json',
      'Content-length': `${ body.length }`
    },
    method: 'PUT',
    body
  };

  const url = event.ResponseURL;

  logger.debug(`HTTP call to ${ url }`);

  const result: Response = await fetch(url, options);

  const HTTP_MAX_SUCCESS_CODE = 299;

  if (result.status > HTTP_MAX_SUCCESS_CODE) {
    throw new Error(
      `http request failed ${ url } [${ result.status }] ${ JSON.stringify(result.json()) }`
    );
  }

  logger.debug(`CloudFormation response sent. HTTP status was ${ result.status }`);
};
