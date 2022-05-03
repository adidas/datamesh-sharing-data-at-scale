import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { EvaluateExpression, LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type CreateGlueDatabaseChainProps = {
  readonly parallelFlowType: 'LF' | 'Iam';
  readonly successChain: Chain;
  readonly createGlueDatabasesLambda: IFunction;
};

export class CreateGlueDatabaseChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: CreateGlueDatabaseChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: CreateGlueDatabaseChainProps) {
    return Chain
      .start(this.createGlueDatabaseName(props))
      .next(this.createGlueDatabase(props))
      .next(props.successChain);
  }

  private createGlueDatabaseName({ parallelFlowType }: CreateGlueDatabaseChainProps): IChainable {
    return new EvaluateExpression(this, `Create Glue ${ parallelFlowType } Database Name`, {
      /* eslint-disable no-template-curly-in-string */
      expression: parallelFlowType === 'LF'
        ? '`${ $.dataProductObject.data-product-name }_lf`'
        : '`${ $.dataProductObject.data-product-name }_iam`',
      resultPath: '$.glueDatabaseName'
    });
  }

  private createGlueDatabase({
    createGlueDatabasesLambda, parallelFlowType
  }: CreateGlueDatabaseChainProps): IChainable {
    return new LambdaInvoke(this, `Create Glue ${ parallelFlowType } Database`, {
      inputPath: '$.glueDatabaseName',
      resultPath: JsonPath.DISCARD,
      lambdaFunction: createGlueDatabasesLambda,
      payloadResponseOnly: true
    });
  }
}
