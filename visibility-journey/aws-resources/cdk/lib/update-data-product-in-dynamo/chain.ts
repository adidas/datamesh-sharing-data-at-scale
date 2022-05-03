import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type UpdateDataProductInDynamoChainProps = {
  readonly updateDataProductInDynamoLambda: IFunction;
  readonly failedChain: Chain;
  readonly successChain: Chain;
};

export class UpdateDataProductInDynamoChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: UpdateDataProductInDynamoChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: UpdateDataProductInDynamoChainProps) {
    return Chain
      .start(this.updateDataProductInDynamoChain(props))
      .next(props.successChain);
  }

  private updateDataProductInDynamoChain(props: UpdateDataProductInDynamoChainProps): IChainable {
    const { updateDataProductInDynamoLambda, failedChain } = props;

    return new LambdaInvoke(this, 'Update Data Product In Dynamo', {
      inputPath: '$',
      resultPath: JsonPath.DISCARD,
      lambdaFunction: updateDataProductInDynamoLambda,
      payloadResponseOnly: true
    })
      .addRetry({ maxAttempts: 1 })
      .addCatch(failedChain, { resultPath: '$.error' });
  }
}
