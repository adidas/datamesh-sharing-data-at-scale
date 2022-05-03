import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type RegisterDataProductInDynamoChainProps = {
  readonly registerDataProductInDynamoLambda: IFunction;
  readonly failedChain: Chain;
  readonly successChain: Chain;
};

export class RegisterDataProductInDynamoChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: RegisterDataProductInDynamoChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: RegisterDataProductInDynamoChainProps) {
    return Chain
      .start(this.registerDataProductInDynamoChain(props))
      .next(props.successChain);
  }

  private registerDataProductInDynamoChain(props: RegisterDataProductInDynamoChainProps): IChainable {
    const { registerDataProductInDynamoLambda, failedChain } = props;

    return new LambdaInvoke(this, 'Register Data Product In Dynamo', {
      inputPath: '$',
      resultPath: JsonPath.DISCARD,
      lambdaFunction: registerDataProductInDynamoLambda,
      payloadResponseOnly: true
    })
      .addRetry({ maxAttempts: 1 })
      .addCatch(failedChain, { resultPath: '$.error' });
  }
}
