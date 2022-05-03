import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type AssignDefaultLFTagsToDatabaseChainProps = {
  readonly successChain: Chain;
  readonly assignDefaultLFTagsToDatabaseLambda: IFunction;
};

export class AssignDefaultLFTagsToDatabaseChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: AssignDefaultLFTagsToDatabaseChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: AssignDefaultLFTagsToDatabaseChainProps) {
    return Chain
      .start(this.assignDefaultLFTagsToDatabase(props))
      .next(props.successChain);
  }

  private assignDefaultLFTagsToDatabase({
    assignDefaultLFTagsToDatabaseLambda
  }: AssignDefaultLFTagsToDatabaseChainProps): IChainable {
    return new LambdaInvoke(this, 'Assign Default LF Tags To Database', {
      resultPath: JsonPath.DISCARD,
      lambdaFunction: assignDefaultLFTagsToDatabaseLambda,
      payloadResponseOnly: true
    });
  }
}
