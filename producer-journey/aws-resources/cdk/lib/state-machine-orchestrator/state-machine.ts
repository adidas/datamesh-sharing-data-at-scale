import { Construct, Duration, Stack } from '@aws-cdk/core';
import { StateMachine } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { GetDataProductS3Files } from '../get-data-product-s3-file/get-data-product-s3-file';
import { CreateGlueDatabases } from '../create-glue-databases/create-glue-databases';
import { CreateCrawlers } from '../create-crawlers/create-crawlers';
import { RegisterS3Location } from '../register-location/register-location';
import { ExecuteCrawlers } from '../execute-crawlers/execute-crawlers';
import { CreateDataProductLFTag } from '../create-data-product-lf-tag/create-data-product-lf-tag';
import {
  AssignDefaultLFTagsToDatabase
} from '../assign-default-lf-tags-to-database/assign-default-lf-tags-to-database';
import { GrantAccessToProducer } from '../grant-access-to-producer/grant-access-to-producer';
import { UpdateGlueCatalogPolicy } from '../update-glue-catalog-policy/update-glue-catalog-policy';
import { UpdateS3BucketPolicy } from '../update-s3-bucket-policy/update-s3-bucket-policy';
import {
  RegisterDataProductInDynamo
} from '../register-data-product-in-dynamo/register-data-product-in-dynamo';
import { SendOrchestratorEvent } from '../send-orchestrator-event/send-orchestrator-event';
import { ChainOrchestrator } from './chain-orchestrator';
import stepFunctionConfig from './config/state.machine.config.json';

export type StateMachineOrchestratorProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
  readonly getDataProductS3File: GetDataProductS3Files;
  readonly sendOrchestratorEvent: SendOrchestratorEvent;
  readonly updateGlueCatalogPolicy: UpdateGlueCatalogPolicy;
  readonly updateS3BucketPolicy: UpdateS3BucketPolicy;
  readonly createGlueDatabases: CreateGlueDatabases;
  readonly createCrawlers: CreateCrawlers;
  readonly registerS3Location: RegisterS3Location;
  readonly createDataProductLFTag: CreateDataProductLFTag;
  readonly assignDefaultLFTagsToDatabase: AssignDefaultLFTagsToDatabase;
  readonly grantAccessToProducer: GrantAccessToProducer;
  readonly executeCrawlers: ExecuteCrawlers;
  readonly registerDataProductInDynamo: RegisterDataProductInDynamo;
};

export class StateMachineOrchestrator extends Construct {
  /* AWS resources attached to this stack */
  public readonly producerStateMachine: StateMachine;
  public readonly chainOrchestrator: ChainOrchestrator;

  public constructor(scope: Construct, id: string, props: StateMachineOrchestratorProps) {
    super(scope, id);

    this.chainOrchestrator = new ChainOrchestrator(this, 'ChainOrchestrator', props);
    this.producerStateMachine = this.setupStateMachine(props);
  }

  private setupStateMachine({ stackBaseName, deploymentEnvironment }: StateMachineOrchestratorProps) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { TimeoutMinutes, MaxNameLength } = stepFunctionConfig.StateMachine;

    const stateMachine = new StateMachine(this, 'ProducerJourney', {
      stateMachineName: `${ stackBaseName }-producer-${
        deploymentEnvironment }`.substring(0, MaxNameLength),
      definition: this.chainOrchestrator.chain,
      timeout: Duration.minutes(TimeoutMinutes)
    });

    const lakeFormationAdminRoleName = deploymentEnvironment === PROD_DEPLOYMENT_ENVIRONMENT
      ? 'data-lake-administrator-prod' : 'data-lake-administrator-dev';
    const accountId = Stack.of(this).account;

    stateMachine.addToRolePolicy(
      new PolicyStatement({
        actions: [ 'iam:PassRole', 'sts:AssumeRole', 'iam:GetRole' ],
        resources: [ `arn:aws:iam::${ accountId }:role/${ lakeFormationAdminRoleName }` ]
      })
    );

    return stateMachine;
  }
}
