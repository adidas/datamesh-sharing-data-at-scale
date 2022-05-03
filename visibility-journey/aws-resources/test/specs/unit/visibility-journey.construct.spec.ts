import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { VisibilityJourney, VisibilityJourneyProps } from '../../../cdk/lib/visibility-journey.construct';
import { GetDataProductS3Files } from '../../../cdk/lib/get-data-product-s3-file/get-data-product-s3-file';
import {
  AssignVisibilityFileLFTags
} from '../../../cdk/lib/assign-visibility-file-lf-tags/assign-visibility-file-lf-tags';
import {
  UpdateDataProductInDynamo
} from '../../../cdk/lib/update-data-product-in-dynamo/update-data-product-in-dynamo';
import { StateMachineOrchestrator } from '../../../cdk/lib/state-machine-orchestrator/state-machine';
import { SendOrchestratorEvent } from '../../../cdk/lib/send-orchestrator-event/send-orchestrator-event';

const basicStackId = 'AwsCommon';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const mockedStack: any = jest.fn();
const awsCommonMock: any = {
  getDataProductS3Files: { lambda: 'getDataProductS3FilesLambda' },
  sendOrchestratorEvent: { lambda: 'sendOrchestratorEventLambda' },
  registerDataProductInConfluence: { dataProductCatalogTable: {
    dynamoTable: 'registerDataProductInConfluenceDynamoTable'
  } }
};
const stackBaseProps: VisibilityJourneyProps = {
  deploymentEnvironment,
  stackBaseName,
  awsCommon: awsCommonMock
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../cdk/lib/get-data-product-s3-file/get-data-product-s3-file', () => ({
  GetDataProductS3Files: jest.fn() }));
jest.mock('../../../cdk/lib/assign-visibility-file-lf-tags/assign-visibility-file-lf-tags', () => ({
  AssignVisibilityFileLFTags: jest.fn() }));
jest.mock('../../../cdk/lib/update-data-product-in-dynamo/update-data-product-in-dynamo', () => ({
  UpdateDataProductInDynamo: jest.fn() }));
jest.mock('../../../cdk/lib/send-orchestrator-event/send-orchestrator-event', () => ({
  SendOrchestratorEvent: jest.fn() }));
jest.mock('../../../cdk/lib/state-machine-orchestrator/state-machine', () => ({ StateMachineOrchestrator: jest.fn() }));

describe('# VisibilityJourney', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new VisibilityJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a GetDataProductS3Files construct', (done) => {
    const constructId = 'GetDataProductS3Files';
    const construct = new VisibilityJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(GetDataProductS3Files).toHaveBeenCalledTimes(1);
    expect(GetDataProductS3Files).toHaveBeenCalledWith(construct, constructId, {
      getDataProductS3FilesLambda: awsCommonMock.getDataProductS3Files.lambda
    });

    done();
  });

  it('Should have a SendOrchestratorEvent construct', (done) => {
    const constructId = 'SendOrchestratorEvent';
    const construct = new VisibilityJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(SendOrchestratorEvent).toHaveBeenCalledTimes(1);
    expect(SendOrchestratorEvent).toHaveBeenCalledWith(construct, constructId, {
      sendOrchestratorEventLambda: awsCommonMock.sendOrchestratorEvent.lambda
    });

    done();
  });

  it('Should have a AssignVisibilityFileLFTags construct', (done) => {
    const constructId = 'AssignVisibilityFileLFTags';
    const construct = new VisibilityJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(AssignVisibilityFileLFTags).toHaveBeenCalledTimes(1);
    expect(AssignVisibilityFileLFTags).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName
    });

    done();
  });

  it('Should have a UpdateDataProductInDynamo construct', (done) => {
    const constructId = 'UpdateDataProductInDynamo';
    const construct = new VisibilityJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(UpdateDataProductInDynamo).toHaveBeenCalledTimes(1);
    expect(UpdateDataProductInDynamo).toHaveBeenCalledWith(construct, constructId, {
      dataProductCatalogTable: awsCommonMock.registerDataProductInConfluence.dataProductCatalogTable.dynamoTable,
      deploymentEnvironment,
      stackBaseName
    });

    done();
  });

  it('Should have a StateMachineOrchestrator construct', (done) => {
    const constructId = 'StateMachineOrchestrator';
    const construct = new VisibilityJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(StateMachineOrchestrator).toHaveBeenCalledTimes(1);
    expect(StateMachineOrchestrator).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName,
      sendOrchestratorEvent: getMockObject(SendOrchestratorEvent).mock.instances[0],
      getDataProductS3File: getMockObject(GetDataProductS3Files).mock.instances[0],
      assignVisibilityFileLFTags: getMockObject(AssignVisibilityFileLFTags).mock.instances[0],
      updateDataProductInDynamo: getMockObject(UpdateDataProductInDynamo).mock.instances[0]
    });

    done();
  });
});
