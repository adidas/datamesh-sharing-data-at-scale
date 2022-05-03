import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { ProducerJourney, ProducerJourneyProps } from '../../../cdk/lib/producer-journey.construct';
import { GetDataProductS3Files } from '../../../cdk/lib/get-data-product-s3-file/get-data-product-s3-file';
import { UpdateGlueCatalogPolicy } from '../../../cdk/lib/update-glue-catalog-policy/update-glue-catalog-policy';
import { UpdateS3BucketPolicy } from '../../../cdk/lib/update-s3-bucket-policy/update-s3-bucket-policy';
import { CreateGlueDatabases } from '../../../cdk/lib/create-glue-databases/create-glue-databases';
import { CreateCrawlers } from '../../../cdk/lib/create-crawlers/create-crawlers';
import { RegisterS3Location } from '../../../cdk/lib/register-location/register-location';
import { CreateDataProductLFTag } from '../../../cdk/lib/create-data-product-lf-tag/create-data-product-lf-tag';
import {
  AssignDefaultLFTagsToDatabase
} from '../../../cdk/lib/assign-default-lf-tags-to-database/assign-default-lf-tags-to-database';
import { GrantAccessToProducer } from '../../../cdk/lib/grant-access-to-producer/grant-access-to-producer';
import { ExecuteCrawlers } from '../../../cdk/lib/execute-crawlers/execute-crawlers';
import {
  RegisterDataProductInDynamo
} from '../../../cdk/lib/register-data-product-in-dynamo/register-data-product-in-dynamo';
import { StateMachineOrchestrator } from '../../../cdk/lib/state-machine-orchestrator/state-machine';
import { SendOrchestratorEvent } from '../../../cdk/lib/send-orchestrator-event/send-orchestrator-event';

const basicStackId = 'AwsCommon';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const mockedStack: any = jest.fn();
const awsCommonMock: any = {
  getDataProductS3Files: { lambda: 'getDataProductS3FilesLambda' },
  updateGlueCatalogPolicy: { updateGlueCatalogPolicySqs: { sqs: 'updateGlueCatalogPolicyLambda' } },
  sendOrchestratorEvent: { lambda: 'sendOrchestratorEventLambda' },
  registerDataProductInConfluence: { dataProductCatalogTable: {
    dynamoTable: 'registerDataProductInConfluenceDynamoTable'
  } }
};
const stackBaseProps: ProducerJourneyProps = {
  deploymentEnvironment,
  stackBaseName,
  awsCommon: awsCommonMock
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../cdk/lib/get-data-product-s3-file/get-data-product-s3-file', () => ({
  GetDataProductS3Files: jest.fn() }));
jest.mock('../../../cdk/lib/update-glue-catalog-policy/update-glue-catalog-policy', () => ({
  UpdateGlueCatalogPolicy: jest.fn() }));
jest.mock('../../../cdk/lib/update-s3-bucket-policy/update-s3-bucket-policy', () => ({
  UpdateS3BucketPolicy: jest.fn() }));
jest.mock('../../../cdk/lib/create-glue-databases/create-glue-databases', () => ({ CreateGlueDatabases: jest.fn() }));
jest.mock('../../../cdk/lib/create-crawlers/create-crawlers', () => ({ CreateCrawlers: jest.fn() }));
jest.mock('../../../cdk/lib/register-location/register-location', () => ({ RegisterS3Location: jest.fn() }));
jest.mock('../../../cdk/lib/create-data-product-lf-tag/create-data-product-lf-tag', () => ({
  CreateDataProductLFTag: jest.fn() }));
jest.mock('../../../cdk/lib/assign-default-lf-tags-to-database/assign-default-lf-tags-to-database', () => ({
  AssignDefaultLFTagsToDatabase: jest.fn() }));
jest.mock('../../../cdk/lib/grant-access-to-producer/grant-access-to-producer', () => ({
  GrantAccessToProducer: jest.fn() }));
jest.mock('../../../cdk/lib/execute-crawlers/execute-crawlers', () => ({ ExecuteCrawlers: jest.fn() }));
jest.mock('../../../cdk/lib/register-data-product-in-dynamo/register-data-product-in-dynamo', () => ({
  RegisterDataProductInDynamo: jest.fn() }));
jest.mock('../../../cdk/lib/send-orchestrator-event/send-orchestrator-event', () => ({
  SendOrchestratorEvent: jest.fn() }));
jest.mock('../../../cdk/lib/state-machine-orchestrator/state-machine', () => ({ StateMachineOrchestrator: jest.fn() }));

describe('# ProducerJourney', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a GetDataProductS3Files construct', (done) => {
    const constructId = 'GetDataProductS3Files';
    const construct = new ProducerJourney(
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
    const construct = new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(SendOrchestratorEvent).toHaveBeenCalledTimes(1);
    expect(SendOrchestratorEvent).toHaveBeenCalledWith(construct, constructId, {
      sendOrchestratorEventLambda: awsCommonMock.sendOrchestratorEvent.lambda
    });

    done();
  });

  it('Should have a UpdateGlueCatalogPolicy construct', (done) => {
    const constructId = 'UpdateGlueCatalogPolicy';
    const construct = new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(UpdateGlueCatalogPolicy).toHaveBeenCalledTimes(1);
    expect(UpdateGlueCatalogPolicy).toHaveBeenCalledWith(construct, constructId, {
      updateGlueCatalogPolicySqs: awsCommonMock.updateGlueCatalogPolicy.updateGlueCatalogPolicySqs.sqs
    });

    done();
  });

  it('Should have a UpdateS3BucketPolicy construct', (done) => {
    const constructId = 'UpdateS3BucketPolicyProducer';
    const construct = new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(UpdateS3BucketPolicy).toHaveBeenCalledTimes(1);
    expect(UpdateS3BucketPolicy).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName
    });

    done();
  });

  it('Should have a CreateGlueDatabases construct', (done) => {
    const constructId = 'CreateGlueDatabases';
    const construct = new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(CreateGlueDatabases).toHaveBeenCalledTimes(1);
    expect(CreateGlueDatabases).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName
    });

    done();
  });

  it('Should have a CreateCrawlers construct', (done) => {
    const constructId = 'CreateCrawlers';
    const construct = new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(CreateCrawlers).toHaveBeenCalledTimes(1);
    expect(CreateCrawlers).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName
    });

    done();
  });

  it('Should have a RegisterS3Location construct', (done) => {
    const constructId = 'RegisterS3Location';
    const construct = new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(RegisterS3Location).toHaveBeenCalledTimes(1);
    expect(RegisterS3Location).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName
    });

    done();
  });

  it('Should have a CreateDataProductLFTag construct', (done) => {
    const constructId = 'CreateDataProductLFTag';
    const construct = new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(CreateDataProductLFTag).toHaveBeenCalledTimes(1);
    expect(CreateDataProductLFTag).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName
    });

    done();
  });

  it('Should have a AssignDefaultLFTagsToDatabase construct', (done) => {
    const constructId = 'AssignDefaultLFTagsToDatabase';
    const construct = new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(AssignDefaultLFTagsToDatabase).toHaveBeenCalledTimes(1);
    expect(AssignDefaultLFTagsToDatabase).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName
    });

    done();
  });

  it('Should have a GrantAccessToProducer construct', (done) => {
    const constructId = 'GrantAccessToProducer';
    const construct = new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(GrantAccessToProducer).toHaveBeenCalledTimes(1);
    expect(GrantAccessToProducer).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName
    });

    done();
  });

  it('Should have a ExecuteCrawlers construct', (done) => {
    const constructId = 'ExecuteCrawlers';
    const construct = new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(ExecuteCrawlers).toHaveBeenCalledTimes(1);
    expect(ExecuteCrawlers).toHaveBeenCalledWith(construct, constructId);

    done();
  });

  it('Should have a RegisterDataProductInDynamo construct', (done) => {
    const constructId = 'RegisterDataProductInDynamo';
    const construct = new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(RegisterDataProductInDynamo).toHaveBeenCalledTimes(1);
    expect(RegisterDataProductInDynamo).toHaveBeenCalledWith(construct, constructId, {
      dataProductCatalogTable: awsCommonMock.registerDataProductInConfluence.dataProductCatalogTable.dynamoTable,
      deploymentEnvironment,
      stackBaseName
    });

    done();
  });

  it('Should have a StateMachineOrchestrator construct', (done) => {
    const constructId = 'StateMachineOrchestrator';
    const construct = new ProducerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(StateMachineOrchestrator).toHaveBeenCalledTimes(1);
    expect(StateMachineOrchestrator).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName,
      getDataProductS3File: getMockObject(GetDataProductS3Files).mock.instances[0],
      sendOrchestratorEvent: getMockObject(SendOrchestratorEvent).mock.instances[0],
      updateGlueCatalogPolicy: getMockObject(UpdateGlueCatalogPolicy).mock.instances[0],
      updateS3BucketPolicy: getMockObject(UpdateS3BucketPolicy).mock.instances[0],
      createGlueDatabases: getMockObject(CreateGlueDatabases).mock.instances[0],
      createCrawlers: getMockObject(CreateCrawlers).mock.instances[0],
      registerS3Location: getMockObject(RegisterS3Location).mock.instances[0],
      createDataProductLFTag: getMockObject(CreateDataProductLFTag).mock.instances[0],
      grantAccessToProducer: getMockObject(GrantAccessToProducer).mock.instances[0],
      assignDefaultLFTagsToDatabase: getMockObject(AssignDefaultLFTagsToDatabase).mock.instances[0],
      executeCrawlers: getMockObject(ExecuteCrawlers).mock.instances[0],
      registerDataProductInDynamo: getMockObject(RegisterDataProductInDynamo).mock.instances[0]
    });

    done();
  });
});
