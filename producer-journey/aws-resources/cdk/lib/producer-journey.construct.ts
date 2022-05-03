import { Construct } from '@aws-cdk/core';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { AwsCommon } from '@adidas-data-mesh/common-aws';
import { GetDataProductS3Files } from './get-data-product-s3-file/get-data-product-s3-file';
import { StateMachineOrchestrator } from './state-machine-orchestrator/state-machine';
import { CreateGlueDatabases } from './create-glue-databases/create-glue-databases';
import { CreateCrawlers } from './create-crawlers/create-crawlers';
import { RegisterS3Location } from './register-location/register-location';
import { ExecuteCrawlers } from './execute-crawlers/execute-crawlers';
import { CreateDataProductLFTag } from './create-data-product-lf-tag/create-data-product-lf-tag';
import { AssignDefaultLFTagsToDatabase } from './assign-default-lf-tags-to-database/assign-default-lf-tags-to-database';
import { GrantAccessToProducer } from './grant-access-to-producer/grant-access-to-producer';
import { UpdateGlueCatalogPolicy } from './update-glue-catalog-policy/update-glue-catalog-policy';
import { UpdateS3BucketPolicy } from './update-s3-bucket-policy/update-s3-bucket-policy';
import { RegisterDataProductInDynamo } from './register-data-product-in-dynamo/register-data-product-in-dynamo';
import { SendOrchestratorEvent } from './send-orchestrator-event/send-orchestrator-event';

export type ProducerJourneyProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
  readonly awsCommon: AwsCommon;
};

export class ProducerJourney extends Construct {
  /* AWS resources attached to this construct */
  public readonly stateMachineOrchestrator: StateMachineOrchestrator;
  public readonly getDataProductS3Files: GetDataProductS3Files;
  public readonly sendOrchestratorEvent: SendOrchestratorEvent;
  public readonly updateGlueCatalogPolicy: UpdateGlueCatalogPolicy;
  public readonly updateS3BucketPolicy: UpdateS3BucketPolicy;
  public readonly createGlueDatabases: CreateGlueDatabases;
  public readonly createCrawlers: CreateCrawlers;
  public readonly registerS3Location: RegisterS3Location;
  public readonly createDataProductLFTag: CreateDataProductLFTag;
  public readonly assignDefaultLFTagsToDatabase: AssignDefaultLFTagsToDatabase;
  public readonly grantAccessToProducer: GrantAccessToProducer;
  public readonly executeCrawlers: ExecuteCrawlers;
  public readonly registerDataProductInDynamo: RegisterDataProductInDynamo;

  public constructor(scope: Construct, id: string, props: ProducerJourneyProps) {
    super(scope, id);

    const { deploymentEnvironment, stackBaseName, awsCommon } = props;

    this.getDataProductS3Files = new GetDataProductS3Files(this, 'GetDataProductS3Files', {
      getDataProductS3FilesLambda: awsCommon.getDataProductS3Files.lambda
    });
    this.sendOrchestratorEvent = new SendOrchestratorEvent(this, 'SendOrchestratorEvent', {
      sendOrchestratorEventLambda: awsCommon.sendOrchestratorEvent.lambda
    });
    this.updateGlueCatalogPolicy = new UpdateGlueCatalogPolicy(this, 'UpdateGlueCatalogPolicy', {
      updateGlueCatalogPolicySqs: awsCommon.updateGlueCatalogPolicy.updateGlueCatalogPolicySqs.sqs
    });
    this.updateS3BucketPolicy = new UpdateS3BucketPolicy(this, 'UpdateS3BucketPolicyProducer', {
      stackBaseName,
      deploymentEnvironment
    });
    this.createGlueDatabases = new CreateGlueDatabases(this, 'CreateGlueDatabases', {
      stackBaseName,
      deploymentEnvironment
    });
    this.createCrawlers = new CreateCrawlers(this, 'CreateCrawlers', {
      deploymentEnvironment,
      stackBaseName
    });
    this.registerS3Location = new RegisterS3Location(this, 'RegisterS3Location', {
      stackBaseName,
      deploymentEnvironment
    });
    this.createDataProductLFTag = new CreateDataProductLFTag(this, 'CreateDataProductLFTag', {
      stackBaseName,
      deploymentEnvironment
    });
    this.assignDefaultLFTagsToDatabase = new AssignDefaultLFTagsToDatabase(this, 'AssignDefaultLFTagsToDatabase', {
      stackBaseName,
      deploymentEnvironment
    });
    this.grantAccessToProducer = new GrantAccessToProducer(this, 'GrantAccessToProducer', {
      stackBaseName,
      deploymentEnvironment
    });
    this.executeCrawlers = new ExecuteCrawlers(this, 'ExecuteCrawlers');
    this.registerDataProductInDynamo = new RegisterDataProductInDynamo(this, 'RegisterDataProductInDynamo', {
      dataProductCatalogTable: awsCommon.registerDataProductInConfluence.dataProductCatalogTable.dynamoTable,
      stackBaseName,
      deploymentEnvironment
    });

    this.stateMachineOrchestrator = new StateMachineOrchestrator(this, 'StateMachineOrchestrator', {
      deploymentEnvironment,
      stackBaseName,
      getDataProductS3File: this.getDataProductS3Files,
      updateGlueCatalogPolicy: this.updateGlueCatalogPolicy,
      updateS3BucketPolicy: this.updateS3BucketPolicy,
      sendOrchestratorEvent: this.sendOrchestratorEvent,
      createGlueDatabases: this.createGlueDatabases,
      createCrawlers: this.createCrawlers,
      registerS3Location: this.registerS3Location,
      createDataProductLFTag: this.createDataProductLFTag,
      grantAccessToProducer: this.grantAccessToProducer,
      assignDefaultLFTagsToDatabase: this.assignDefaultLFTagsToDatabase,
      executeCrawlers: this.executeCrawlers,
      registerDataProductInDynamo: this.registerDataProductInDynamo
    });
  }
}
