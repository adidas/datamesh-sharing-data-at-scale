import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type GrantAccessToConsumerChainProps = {
  readonly successChain: Chain;
  readonly grantAccessToConsumerLambda: IFunction;
};

export class GrantAccessToConsumerChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: GrantAccessToConsumerChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: GrantAccessToConsumerChainProps) {
    return Chain
      .start(this.grantAccessToConsumer(props))
      .next(props.successChain);
  }

  private grantAccessToConsumer({
    grantAccessToConsumerLambda
  }: GrantAccessToConsumerChainProps): IChainable {
    return new LambdaInvoke(this, 'Grant Access to Consumer', {
      inputPath: '$',
      resultPath: JsonPath.DISCARD,
      lambdaFunction: grantAccessToConsumerLambda,
      payloadResponseOnly: true
    });
  }
}
