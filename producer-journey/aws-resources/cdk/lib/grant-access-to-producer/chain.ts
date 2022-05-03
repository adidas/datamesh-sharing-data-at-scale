import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type GrantAccessToProducerChainProps = {
  readonly successChain: Chain;
  readonly grantAccessToProducerLambda: IFunction;
};

export class GrantAccessToProducerChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: GrantAccessToProducerChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: GrantAccessToProducerChainProps) {
    return Chain
      .start(this.grantAccessToProducer(props))
      .next(props.successChain);
  }

  private grantAccessToProducer({ grantAccessToProducerLambda }: GrantAccessToProducerChainProps): IChainable {
    return new LambdaInvoke(this, 'Grant Access to Producer For Database', {
      inputPath: '$',
      resultPath: JsonPath.DISCARD,
      lambdaFunction: grantAccessToProducerLambda,
      payloadResponseOnly: true
    });
  }
}
