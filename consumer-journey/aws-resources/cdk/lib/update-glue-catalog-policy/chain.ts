import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath, TaskInput } from '@aws-cdk/aws-stepfunctions';
import { SqsSendMessage } from '@aws-cdk/aws-stepfunctions-tasks';
import { IQueue } from '@aws-cdk/aws-sqs';

export type UpdateGlueCatalogPolicyChainProps = {
  readonly updateGlueCatalogPolicySqs: IQueue;
  readonly successChain: Chain;
};

export class UpdateGlueCatalogPolicyChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: UpdateGlueCatalogPolicyChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: UpdateGlueCatalogPolicyChainProps) {
    return Chain
      .start(this.updateGlueCatalogPolicy(props))
      .next(props.successChain);
  }

  private updateGlueCatalogPolicy({
    updateGlueCatalogPolicySqs
  }: UpdateGlueCatalogPolicyChainProps): IChainable {
    return new SqsSendMessage(this, 'Update Glue Catalog Policy Lambda', {
      resultPath: JsonPath.DISCARD,
      messageGroupId: '1',
      queue: updateGlueCatalogPolicySqs,
      messageBody: TaskInput.fromJsonPathAt('$.currentConsumer.account')
    })
      .addRetry({ maxAttempts: 1 });
  }
}
