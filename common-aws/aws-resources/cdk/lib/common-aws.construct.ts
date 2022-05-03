import { Construct } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { EventBus } from '@aws-cdk/aws-events';
import { GetDataProductS3Files } from './get-data-product-s3-file/lambda';
import {
  RegisterDataProductInConfluence
} from './register-data-product-in-confluence/register-data-product-in-confluence';
import { SendOrchestratorEvent } from './send-orchestrator-event/lambda';
import { UpdateGlueCatalogPolicy } from './update-glue-catalog-policy/update-glue-catalog-policy';

export type AwsCommonProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
  readonly dataProductCatalogueBucket: Bucket;
  readonly orchestratorEventBus: EventBus;
};

export class AwsCommon extends Construct {
  /* AWS resources attached to this construct */
  public readonly getDataProductS3Files: GetDataProductS3Files;
  public readonly updateGlueCatalogPolicy: UpdateGlueCatalogPolicy;
  public readonly registerDataProductInConfluence: RegisterDataProductInConfluence;
  public readonly sendOrchestratorEvent: SendOrchestratorEvent;

  public constructor(scope: Construct, id: string, props: AwsCommonProps) {
    super(scope, id);

    const { deploymentEnvironment, stackBaseName, dataProductCatalogueBucket, orchestratorEventBus } = props;

    this.getDataProductS3Files = new GetDataProductS3Files(this, 'GetDataProductS3Files', {
      deploymentEnvironment,
      stackBaseName,
      dataProductCatalogueBucket
    });

    this.updateGlueCatalogPolicy = new UpdateGlueCatalogPolicy(this, 'UpdateGlueCatalogPolicy', {
      deploymentEnvironment,
      stackBaseName
    });

    this.registerDataProductInConfluence = new RegisterDataProductInConfluence(this, 'RegisterDataProductInConfluence', {
      deploymentEnvironment,
      stackBaseName
    });

    this.sendOrchestratorEvent = new SendOrchestratorEvent(this, 'SendOrchestratorEvent', {
      deploymentEnvironment,
      stackBaseName,
      orchestratorEventBus
    });
  }
}
