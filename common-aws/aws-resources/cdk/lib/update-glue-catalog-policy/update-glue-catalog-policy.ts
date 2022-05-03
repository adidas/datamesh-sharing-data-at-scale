import { Construct } from '@aws-cdk/core';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { UpdateGlueCatalogPolicyLambda } from './lambda';
import { UpdateGlueCatalogPolicySqs } from './sqs';

export type UpdateGlueCatalogPolicyProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class UpdateGlueCatalogPolicy extends Construct {
  /* AWS resources attached to this construct */
  public readonly registerDataProductInConfluenceLambda: UpdateGlueCatalogPolicyLambda;
  public readonly updateGlueCatalogPolicySqs: UpdateGlueCatalogPolicySqs;

  public constructor(scope: Construct, id: string, props: UpdateGlueCatalogPolicyProps) {
    super(scope, id);

    const { deploymentEnvironment, stackBaseName } = props;

    this.registerDataProductInConfluenceLambda =
      new UpdateGlueCatalogPolicyLambda(this, 'UpdateGlueCatalogPolicyLambda', {
        deploymentEnvironment,
        stackBaseName
      });

    this.updateGlueCatalogPolicySqs = new UpdateGlueCatalogPolicySqs(this, 'UpdateGlueCatalogPolicySqs', {
      deploymentEnvironment,
      registerDataProductInConfluenceLambda: this.registerDataProductInConfluenceLambda.lambda
    });
  }
}
