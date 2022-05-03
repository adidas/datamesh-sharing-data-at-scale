import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { EvaluateExpression, LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type CreateLinkedDatabaseChainProps = {
  readonly successChain: Chain;
  readonly createLinkedDatabaseLambda: IFunction;
};

export class CreateLinkedDatabaseChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: CreateLinkedDatabaseChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: CreateLinkedDatabaseChainProps) {
    return Chain
      .start(this.createLinkedDatabaseName())
      .next(this.createLinkedDatabase(props))
      .next(props.successChain);
  }

  private createLinkedDatabaseName(): IChainable {
    return new EvaluateExpression(this, 'Create Linked Database Name', {
      /* eslint-disable no-template-curly-in-string */
      expression: '`${ $.dataProductObject.data-product-name }_lf`',
      resultPath: '$.currentConsumer.databaseName'
    });
  }

  private createLinkedDatabase({
    createLinkedDatabaseLambda
  }: CreateLinkedDatabaseChainProps): IChainable {
    return new LambdaInvoke(this, 'Create Linked Database', {
      inputPath: '$.currentConsumer',
      resultPath: JsonPath.DISCARD,
      lambdaFunction: createLinkedDatabaseLambda,
      payloadResponseOnly: true
    });
  }
}
