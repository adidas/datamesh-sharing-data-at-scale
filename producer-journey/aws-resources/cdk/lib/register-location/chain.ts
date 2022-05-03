import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type RegisterS3LocationChainProps = {
  readonly registerS3LocationLambda: IFunction;
  readonly failedChain: Chain;
  readonly successChain: Chain;
};

export class RegisterS3LocationChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: RegisterS3LocationChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: RegisterS3LocationChainProps) {
    return Chain
      .start(this.registerS3Location(props))
      .next(props.successChain);
  }

  private registerS3Location({ registerS3LocationLambda, failedChain }: RegisterS3LocationChainProps): IChainable {
    return new LambdaInvoke(this, 'Register S3 Location', {
      resultPath: JsonPath.DISCARD,
      lambdaFunction: registerS3LocationLambda,
      payloadResponseOnly: true
    })
    .addRetry({ maxAttempts: 1 })
    .addCatch(failedChain, { resultPath: '$.error' });
  }
}
