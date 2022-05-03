import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { CreateDataProductLFTagChain } from './chain';
import { CreateDataProductLFTagLambda } from './lambda';

export type CreateDataProductLFTagProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class CreateDataProductLFTag extends Construct {
  /* AWS resources attached to this construct */
  private readonly createDataProductLFTagLambda: CreateDataProductLFTagLambda;

  public constructor(scope: Construct, id: string, props: CreateDataProductLFTagProps) {
    super(scope, id);
    const { deploymentEnvironment, stackBaseName } = props;

    this.createDataProductLFTagLambda =
      new CreateDataProductLFTagLambda(this, 'CreateDataProductLFTagLambda', {
        deploymentEnvironment,
        stackBaseName
      });
  }

  public setupChain(failedChain: Chain, successChain: Chain): CreateDataProductLFTagChain {
    const newChain = new CreateDataProductLFTagChain(this, 'CreateDataProductLFTagChain', {
      successChain,
      failedChain,
      createDataProductLFTagLambda: this.createDataProductLFTagLambda.lambda
    });

    return newChain;
  }
}
