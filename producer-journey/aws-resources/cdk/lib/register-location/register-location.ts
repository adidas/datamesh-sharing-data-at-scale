import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { RegisterS3LocationChain } from './chain';
import { RegisterS3LocationLambda } from './lambda';

export type RegisterS3LocationProps = {
  readonly stackBaseName: string;
  readonly deploymentEnvironment: DeploymentEnvironment;
};

export class RegisterS3Location extends Construct {
  /* AWS resources attached to this construct */
  private readonly registerS3LocationLambda: RegisterS3LocationLambda;

  public constructor(scope: Construct, id: string, { deploymentEnvironment, stackBaseName }: RegisterS3LocationProps) {
    super(scope, id);

    this.registerS3LocationLambda = new RegisterS3LocationLambda(this, 'RegisterS3LocationLambda', {
      deploymentEnvironment,
      stackBaseName
    });
  }

  public setupChain(failedChain: Chain, successChain: Chain): RegisterS3LocationChain {
    const newChain = new RegisterS3LocationChain(this, 'RegisterS3LocationChain', {
      registerS3LocationLambda: this.registerS3LocationLambda.lambda,
      failedChain,
      successChain
    });

    return newChain;
  }
}
