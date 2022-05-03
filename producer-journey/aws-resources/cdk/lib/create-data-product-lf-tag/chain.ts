import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type CreateDataProductLFTagChainProps = {
  readonly failedChain: Chain;
  readonly successChain: Chain;
  readonly createDataProductLFTagLambda: IFunction;
};

export class CreateDataProductLFTagChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: CreateDataProductLFTagChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: CreateDataProductLFTagChainProps) {
    return Chain
      .start(this.createDataProductLFTag(props))
      .next(props.successChain);
  }

  private createDataProductLFTag({
    createDataProductLFTagLambda, failedChain
  }: CreateDataProductLFTagChainProps): IChainable {
    return new LambdaInvoke(this, 'Create Data Product LF Tag', {
      inputPath: JsonPath.stringAt('$.dataProductObject.data-product-name'),
      resultPath: JsonPath.DISCARD,
      lambdaFunction: createDataProductLFTagLambda,
      payloadResponseOnly: true
    })
    .addRetry({ maxAttempts: 1 })
    .addCatch(failedChain, { resultPath: '$.error' });
  }
}
