import { Construct } from '@aws-cdk/core';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { AwsCommon } from '@adidas-data-mesh/common-aws';
import { GetDataProductS3Files } from './get-data-product-s3-file/get-data-product-s3-file';
import { StateMachineOrchestrator } from './state-machine-orchestrator/state-machine';
import { AssignVisibilityFileLFTags } from './assign-visibility-file-lf-tags/assign-visibility-file-lf-tags';
import { UpdateDataProductInDynamo } from './update-data-product-in-dynamo/update-data-product-in-dynamo';
import { SendOrchestratorEvent } from './send-orchestrator-event/send-orchestrator-event';

export type VisibilityJourneyProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
  readonly awsCommon: AwsCommon;
};

export class VisibilityJourney extends Construct {
  /* AWS resources attached to this construct */
  public readonly stateMachineOrchestrator: StateMachineOrchestrator;
  public readonly getDataProductS3Files: GetDataProductS3Files;
  public readonly sendOrchestratorEvent: SendOrchestratorEvent;
  public readonly updateDataProductInDynamo: UpdateDataProductInDynamo;
  public readonly assignVisibilityFileLFTags: AssignVisibilityFileLFTags;

  public constructor(scope: Construct, id: string, props: VisibilityJourneyProps) {
    super(scope, id);

    const { deploymentEnvironment, stackBaseName, awsCommon } = props;

    this.getDataProductS3Files = new GetDataProductS3Files(this, 'GetDataProductS3Files', {
      getDataProductS3FilesLambda: awsCommon.getDataProductS3Files.lambda
    });
    this.sendOrchestratorEvent = new SendOrchestratorEvent(this, 'SendOrchestratorEvent', {
      sendOrchestratorEventLambda: awsCommon.sendOrchestratorEvent.lambda
    });
    this.assignVisibilityFileLFTags = new AssignVisibilityFileLFTags(this, 'AssignVisibilityFileLFTags', {
      stackBaseName,
      deploymentEnvironment
    });
    this.updateDataProductInDynamo = new UpdateDataProductInDynamo(this, 'UpdateDataProductInDynamo', {
      dataProductCatalogTable: awsCommon.registerDataProductInConfluence.dataProductCatalogTable.dynamoTable,
      stackBaseName,
      deploymentEnvironment
    });

    this.stateMachineOrchestrator = new StateMachineOrchestrator(this, 'StateMachineOrchestrator', {
      deploymentEnvironment,
      stackBaseName,
      getDataProductS3File: this.getDataProductS3Files,
      sendOrchestratorEvent: this.sendOrchestratorEvent,
      assignVisibilityFileLFTags: this.assignVisibilityFileLFTags,
      updateDataProductInDynamo: this.updateDataProductInDynamo
    });
  }
}
