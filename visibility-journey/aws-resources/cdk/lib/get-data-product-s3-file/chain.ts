import { Construct } from '@aws-cdk/core';
import { Chain, IChainable } from '@aws-cdk/aws-stepfunctions';
import { EvaluateExpression, LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type GetDataProductS3FilesChainProps = {
  readonly getDataProductS3FilesLambda: IFunction;
  readonly failedChain: Chain;
  readonly successChain: Chain;
};

export class GetDataProductS3FilesChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: GetDataProductS3FilesChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: GetDataProductS3FilesChainProps) {
    return Chain
      .start(this.createGetDataProductS3FilesChain(props))
      .next(this.createGlueDatabaseName())
      .next(props.successChain);
  }

  private createGetDataProductS3FilesChain(props: GetDataProductS3FilesChainProps): IChainable {
    const { getDataProductS3FilesLambda, failedChain } = props;

    return new LambdaInvoke(this, 'Get Data Product S3 Files', {
      inputPath: '$.dataProductName',
      resultPath: '$',
      lambdaFunction: getDataProductS3FilesLambda,
      payloadResponseOnly: true
    })
      .addRetry({ maxAttempts: 1 })
      .addCatch(failedChain, { resultPath: '$.error' });
  }

  private createGlueDatabaseName(): IChainable {
    return new EvaluateExpression(this, 'Create Glue LF Database Name', {
      /* eslint-disable no-template-curly-in-string */
      expression: '`${ $.dataProductObject.data-product-name }_lf`',
      resultPath: '$.glueDatabaseName'
    });
  }
}
