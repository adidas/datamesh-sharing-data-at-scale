import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type GrantAccessToConsumerRoleChainProps = {
  readonly successChain: Chain;
  readonly grantAccessToConsumerRoleLambda: IFunction;
};

export class GrantAccessToConsumerRoleChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: GrantAccessToConsumerRoleChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: GrantAccessToConsumerRoleChainProps) {
    return Chain
      .start(this.grantAccessToConsumerRole(props))
      .next(props.successChain);
  }

  private grantAccessToConsumerRole({
    grantAccessToConsumerRoleLambda
  }: GrantAccessToConsumerRoleChainProps): IChainable {
    return new LambdaInvoke(this, 'Grant Access to Consumer Role', {
      inputPath: '$.currentConsumer',
      resultPath: JsonPath.DISCARD,
      lambdaFunction: grantAccessToConsumerRoleLambda,
      payloadResponseOnly: true
    });
  }
}
