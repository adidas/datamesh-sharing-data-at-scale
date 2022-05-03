import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { Queue } from '@aws-cdk/aws-sqs';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { IFunction } from '@aws-cdk/aws-lambda';
import { DeploymentEnvironment, DEV_DEPLOYMENT_ENVIRONMENT, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';

export type UpdateGlueCatalogPolicySqsProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly registerDataProductInConfluenceLambda: IFunction;
};

export class UpdateGlueCatalogPolicySqs extends Construct {
  public readonly sqs: Queue;

  public constructor(scope: Construct, id: string, props: UpdateGlueCatalogPolicySqsProps) {
    super(scope, id);

    const { deploymentEnvironment, registerDataProductInConfluenceLambda } = props;

    this.sqs = new Queue(this, 'UpdateGlueCatalogPolicySqs', {
      queueName: `adidas-UpdateGlueCatalogPolicySqs-${ deploymentEnvironment }.fifo`,
      fifo: true,
      contentBasedDeduplication: true,
      removalPolicy: this.shouldRetainTable(deploymentEnvironment) ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY
    });

    this.sqs.grantConsumeMessages(registerDataProductInConfluenceLambda);
    registerDataProductInConfluenceLambda.addEventSource(new SqsEventSource(this.sqs));
  }

  private shouldRetainTable(deploymentEnvironment: DeploymentEnvironment): boolean {
    return deploymentEnvironment === PROD_DEPLOYMENT_ENVIRONMENT
      || deploymentEnvironment === DEV_DEPLOYMENT_ENVIRONMENT;
  }
}
