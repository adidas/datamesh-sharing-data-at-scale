import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type AssignVisibilityFileLFTagsChainProps = {
  readonly assignVisibilityFileLFTagsLambda: IFunction;
  readonly failedChain: Chain;
  readonly successChain: Chain;
};

export class AssignVisibilityFileLFTagsChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: AssignVisibilityFileLFTagsChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: AssignVisibilityFileLFTagsChainProps) {
    return Chain
      .start(this.assignVisibilityFileLFTags(props))
      .next(props.successChain);
  }

  private assignVisibilityFileLFTags(props: AssignVisibilityFileLFTagsChainProps): IChainable {
    const { assignVisibilityFileLFTagsLambda, failedChain } = props;

    return new LambdaInvoke(this, 'Assign Visibility File LF Tags', {
      inputPath: '$',
      resultPath: JsonPath.DISCARD,
      lambdaFunction: assignVisibilityFileLFTagsLambda,
      payloadResponseOnly: true
    })
    .addRetry({ maxAttempts: 1 })
    .addCatch(failedChain, { resultPath: '$.error' });
  }
}
