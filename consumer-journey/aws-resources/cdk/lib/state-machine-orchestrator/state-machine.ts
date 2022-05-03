import { Construct, Duration, Stack } from '@aws-cdk/core';
import { StateMachine } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { GetDataProductS3Files } from '../get-data-product-s3-file/get-data-product-s3-file';
import { GrantAccessToConsumer } from '../grant-access-to-consumer/grant-access-to-consumer';
import { UpdateGlueCatalogPolicy } from '../update-glue-catalog-policy/update-glue-catalog-policy';
import { UpdateS3BucketPolicy } from '../update-s3-bucket-policy/update-s3-bucket-policy';
import { CreateLinkedDatabase } from '../create-linked-database/create-linked-database';
import { GrantAccessToConsumerRole } from '../grant-access-to-consumer-role/grant-access-to-consumer-role';
import { ChainOrchestrator } from './chain-orchestrator';
import stepFunctionConfig from './config/state.machine.config.json';

export type StateMachineOrchestratorProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
  readonly getDataProductS3Files: GetDataProductS3Files;
  readonly grantAccessToConsumer: GrantAccessToConsumer;
  readonly updateGlueCatalogPolicy: UpdateGlueCatalogPolicy;
  readonly updateS3BucketPolicy: UpdateS3BucketPolicy;
  readonly createLinkedDatabase: CreateLinkedDatabase;
  readonly grantAccessToConsumerRole: GrantAccessToConsumerRole;
};

export class StateMachineOrchestrator extends Construct {
  /* AWS resources attached to this stack */
  public readonly consumerStateMachine: StateMachine;
  public readonly chainOrchestrator: ChainOrchestrator;

  public constructor(scope: Construct, id: string, props: StateMachineOrchestratorProps) {
    super(scope, id);

    this.chainOrchestrator = new ChainOrchestrator(this, 'ChainOrchestrator', props);
    this.consumerStateMachine = this.setupStateMachine(props);
  }

  private setupStateMachine({ stackBaseName, deploymentEnvironment }: StateMachineOrchestratorProps) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { TimeoutMinutes, MaxNameLength } = stepFunctionConfig.StateMachine;

    const stateMachine = new StateMachine(this, 'ConsumerJourney', {
      stateMachineName: `${ stackBaseName }-consumer-${
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
