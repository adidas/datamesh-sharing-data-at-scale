import { Construct, Duration, Stack } from '@aws-cdk/core';
import { StateMachine } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { GetDataProductS3Files } from '../get-data-product-s3-file/get-data-product-s3-file';
import { AssignVisibilityFileLFTags } from '../assign-visibility-file-lf-tags/assign-visibility-file-lf-tags';
import { UpdateDataProductInDynamo } from '../update-data-product-in-dynamo/update-data-product-in-dynamo';
import { SendOrchestratorEvent } from '../send-orchestrator-event/send-orchestrator-event';
import { ChainOrchestrator } from './chain-orchestrator';
import stepFunctionConfig from './config/state.machine.config.json';

export type StateMachineOrchestratorProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
  readonly getDataProductS3File: GetDataProductS3Files;
  readonly assignVisibilityFileLFTags: AssignVisibilityFileLFTags;
  readonly updateDataProductInDynamo: UpdateDataProductInDynamo;
  readonly sendOrchestratorEvent: SendOrchestratorEvent;
};

export class StateMachineOrchestrator extends Construct {
  /* AWS resources attached to this stack */
  public readonly visibilityStateMachine: StateMachine;
  public readonly chainOrchestrator: ChainOrchestrator;

  public constructor(scope: Construct, id: string, props: StateMachineOrchestratorProps) {
    super(scope, id);

    this.chainOrchestrator = new ChainOrchestrator(this, 'ChainOrchestrator', props);
    this.visibilityStateMachine = this.setupStateMachine(props);
  }

  private setupStateMachine({ stackBaseName, deploymentEnvironment }: StateMachineOrchestratorProps) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { TimeoutMinutes, MaxNameLength } = stepFunctionConfig.StateMachine;

    const stateMachine = new StateMachine(this, 'VisibilityJourney', {
      stateMachineName: `${ stackBaseName }-visibility-${
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
