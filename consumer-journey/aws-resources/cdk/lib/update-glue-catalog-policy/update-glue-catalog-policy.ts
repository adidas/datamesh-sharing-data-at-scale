import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { IQueue } from '@aws-cdk/aws-sqs';
import { UpdateGlueCatalogPolicyChain } from './chain';

export type UpdateGlueCatalogPolicyProps = {
  readonly updateGlueCatalogPolicySqs: IQueue;
};

export class UpdateGlueCatalogPolicy extends Construct {
  /* AWS resources attached to this construct */
  public readonly updateGlueCatalogPolicySqs: IQueue;

  public constructor(scope: Construct, id: string, { updateGlueCatalogPolicySqs }: UpdateGlueCatalogPolicyProps) {
    super(scope, id);

    this.updateGlueCatalogPolicySqs = updateGlueCatalogPolicySqs;
  }

  public setupChain(successChain: Chain): UpdateGlueCatalogPolicyChain {
    const newChain = new UpdateGlueCatalogPolicyChain(this, 'UpdateGlueCatalogPolicyChain', {
      successChain,
      updateGlueCatalogPolicySqs: this.updateGlueCatalogPolicySqs
    });

    return newChain;
  }
}
