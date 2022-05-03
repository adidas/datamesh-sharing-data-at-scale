/* eslint-disable import/order */
import { Logger } from '@adidas-data-mesh/common';
import { CloudFormationCustomResourceSuccessResponse } from 'aws-lambda';
import { CustomResourceStatus, sendCustomResourceResponse } from '../../../../src/utils/custom-resource';

const fetch = require('node-fetch');

jest.mock('node-fetch');

const logger = Logger.silent();

const fakeEvent: any = {
  ResponseURL: 'https://cloudformation-custom-resource-response-euwest1.s3-eu-west-1.amazonaws.com/arn'
};
const customResourceResponse: CloudFormationCustomResourceSuccessResponse = {
  Status: CustomResourceStatus.success,
  Reason: 'See the details in CloudWatch Log Stream',
  PhysicalResourceId: 'PhysicalResourceId',
  StackId: 'StackId',
  RequestId: 'RequestId',
  LogicalResourceId: 'CustomScpResourceResourceProtectionEXAMPLE1',
  Data: {
    Arn: 'org-arn'
  },
  NoEcho: false
};

describe('# Custom Resource utils', () => {
  afterEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  describe('sendCustomResourceResponse()', () => {
    it('Should make an http call to send creation feedback of the custom resource', async () => {
      const httpResponse = {
        status: 200
      };
      const body = JSON.stringify(customResourceResponse);
      const options = {
        headers: {
          'Content-Type': 'Application/json',
          'Content-length': `${ body.length }`
        },
        method: 'PUT',
        body
      };
      const url = fakeEvent.ResponseURL;

      fetch.mockReturnValue(httpResponse);

      await sendCustomResourceResponse(fakeEvent)(customResourceResponse, logger);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(url, options);
    });

    it('Should throw an error since the http call has failed', async () => {
      const httpResponse = {
        json: () => ({}),
        status: 500
      };
      const body = JSON.stringify(customResourceResponse);
      const options = {
        headers: {
          'Content-Type': 'Application/json',
          'Content-length': `${ body.length }`
        },
        method: 'PUT',
        body
      };
      const url = fakeEvent.ResponseURL;
      const error = new Error(
        `http request failed ${ url } [${ httpResponse.status }] ${ JSON.stringify(httpResponse.json()) }`
      );

      fetch.mockReturnValue(httpResponse);

      await expect(async () => sendCustomResourceResponse(fakeEvent)(customResourceResponse, logger))
        .rejects.toThrowError(error);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(url, options);
    });
  });
});
