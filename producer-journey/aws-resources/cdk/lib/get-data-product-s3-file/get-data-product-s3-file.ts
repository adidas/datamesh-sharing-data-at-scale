import { Construct } from '@aws-cdk/core';
import { IFunction } from '@aws-cdk/aws-lambda';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { GetDataProductS3FilesChain } from './chain';

export type GetDataProductS3FilesProps = {
  readonly getDataProductS3FilesLambda: IFunction;
};

export class GetDataProductS3Files extends Construct {
  /* AWS resources attached to this construct */
  public readonly getDataProductS3FilesLambda: IFunction;

  public constructor(scope: Construct, id: string, { getDataProductS3FilesLambda }: GetDataProductS3FilesProps) {
    super(scope, id);

    this.getDataProductS3FilesLambda = getDataProductS3FilesLambda;
  }

  public setupChain(failedChain: Chain, successChain: Chain): GetDataProductS3FilesChain {
    const newChain = new GetDataProductS3FilesChain(this, 'GetDataProductS3FilesChain', {
      getDataProductS3FilesLambda: this.getDataProductS3FilesLambda,
      failedChain,
      successChain
    });

    return newChain;
  }
}
