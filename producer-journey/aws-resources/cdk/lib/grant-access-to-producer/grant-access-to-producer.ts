import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { GrantAccessToProducerChain } from './chain';
import { GrantAccessToProducerLambda } from './lambda';

export type GrantAccessToProducerProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class GrantAccessToProducer extends Construct {
  /* AWS resources attached to this construct */
  private readonly grantAccessToProducerLambda: GrantAccessToProducerLambda;

  public constructor(scope: Construct, id: string, props: GrantAccessToProducerProps) {
    super(scope, id);
    const { deploymentEnvironment, stackBaseName } = props;

    this.grantAccessToProducerLambda =
      new GrantAccessToProducerLambda(this, 'GrantAccessToProducerLambda', {
        deploymentEnvironment,
        stackBaseName
      });
  }

  public setupChain(successChain: Chain): GrantAccessToProducerChain {
    const newChain = new GrantAccessToProducerChain(this, 'GrantAccessToProducerChain', {
      successChain,
      grantAccessToProducerLambda: this.grantAccessToProducerLambda.lambda
    });

    return newChain;
  }
}
