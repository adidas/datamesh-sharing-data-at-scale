import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type UpdateS3BucketPolicyChainProps = {
  readonly updateS3BucketPolicy: IFunction;
  readonly failedChain: Chain;
  readonly successChain: Chain;
};

export class UpdateS3BucketPolicyChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: UpdateS3BucketPolicyChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: UpdateS3BucketPolicyChainProps) {
    return Chain
      .start(this.updateS3BucketPolicy(props))
      .next(props.successChain);
  }

  private updateS3BucketPolicy({ updateS3BucketPolicy, failedChain }: UpdateS3BucketPolicyChainProps): IChainable {
    return new LambdaInvoke(this, 'Update S3 Resource Policy', {
      inputPath: '$.dataProductProducerInfoObject',
      resultPath: JsonPath.DISCARD,
      lambdaFunction: updateS3BucketPolicy,
      payloadResponseOnly: true
    })
    .addRetry({ maxAttempts: 1 })
    .addCatch(failedChain, { resultPath: '$.error' });
  }
}
