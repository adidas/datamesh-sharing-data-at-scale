import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { Queue } from '@aws-cdk/aws-sqs';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import {
  UpdateGlueCatalogPolicySqs, UpdateGlueCatalogPolicySqsProps
} from '../../../../cdk/lib/update-glue-catalog-policy/sqs';

const basicStackId = 'UpdateGlueCatalogPolicySqs';
const deploymentEnvironment = 'dev';
const sqsId = 'UpdateGlueCatalogPolicySqs';
const sqsName = `adidas-${ sqsId }-${ deploymentEnvironment }.fifo`;
const grantConsumeMessagesMock = jest.fn();
const addEventSourceMock = jest.fn();
const registerDataProductInConfluenceLambda: any = {
  addEventSource: addEventSourceMock
};
const mockedStack: any = jest.fn();
const stackBaseProps: UpdateGlueCatalogPolicySqsProps = {
  deploymentEnvironment,
  registerDataProductInConfluenceLambda
};

jest.mock('@aws-cdk/core', () => ({
  ...jest.requireActual('@aws-cdk/core'),
  Construct: jest.fn()
}));
jest.mock('@aws-cdk/aws-lambda-event-sources', () => ({ SqsEventSource: jest.fn() }));
jest.mock('@aws-cdk/aws-sqs', () => ({ Queue: jest.fn(() => ({
  grantConsumeMessages: grantConsumeMessagesMock
})) }));

describe('# UpdateGlueCatalogPolicySqs Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new sqs queue successfully for prod or dev environment', (done) => {
    const construct = new UpdateGlueCatalogPolicySqs(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Queue).toHaveBeenCalledTimes(1);
    expect(Queue).toHaveBeenCalledWith(construct, sqsId, {
      fifo: true,
      contentBasedDeduplication: true,
      queueName: sqsName,
      removalPolicy: RemovalPolicy.RETAIN
    });
    expect(grantConsumeMessagesMock).toHaveBeenCalledTimes(1);
    expect(grantConsumeMessagesMock).toHaveBeenCalledWith(registerDataProductInConfluenceLambda);
    expect(SqsEventSource).toHaveBeenCalledTimes(1);
    expect(SqsEventSource).toHaveBeenCalledWith(getMockObject(Queue).mock.results[0].value);
    expect(addEventSourceMock).toHaveBeenCalledTimes(1);
    expect(addEventSourceMock).toHaveBeenCalledWith(getMockObject(SqsEventSource).mock.instances[0]);

    done();
  });

  it('Should create a new sqs queue successfully for feature environment', (done) => {
    const newDeploymentEnvironment = 'adidas-123';
    const construct = new UpdateGlueCatalogPolicySqs(
      mockedStack, basicStackId, {
        ...stackBaseProps,
        deploymentEnvironment: newDeploymentEnvironment
      }
    );

    const newSqsName = `adidas-${ sqsId }-${ newDeploymentEnvironment }.fifo`;

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Queue).toHaveBeenCalledTimes(1);
    expect(Queue).toHaveBeenCalledWith(construct, sqsId, {
      fifo: true,
      contentBasedDeduplication: true,
      queueName: newSqsName,
      removalPolicy: RemovalPolicy.DESTROY
    });
    expect(grantConsumeMessagesMock).toHaveBeenCalledTimes(1);
    expect(grantConsumeMessagesMock).toHaveBeenCalledWith(registerDataProductInConfluenceLambda);
    expect(SqsEventSource).toHaveBeenCalledTimes(1);
    expect(SqsEventSource).toHaveBeenCalledWith(getMockObject(Queue).mock.results[0].value);
    expect(addEventSourceMock).toHaveBeenCalledTimes(1);
    expect(addEventSourceMock).toHaveBeenCalledWith(getMockObject(SqsEventSource).mock.instances[0]);

    done();
  });
});
