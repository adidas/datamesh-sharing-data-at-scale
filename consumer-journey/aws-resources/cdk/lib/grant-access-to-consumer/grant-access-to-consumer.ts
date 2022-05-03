import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { GrantAccessToConsumerChain } from './chain';
import { GrantAccessToConsumerLambda } from './lambda';

export type GrantAccessToConsumerProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class GrantAccessToConsumer extends Construct {
  /* AWS resources attached to this construct */
  public readonly grantAccessToConsumerLambda: GrantAccessToConsumerLambda;

  public constructor(scope: Construct, id: string, props: GrantAccessToConsumerProps) {
    super(scope, id);
    const { deploymentEnvironment, stackBaseName } = props;

    this.grantAccessToConsumerLambda =
      new GrantAccessToConsumerLambda(this, 'GrantAccessToConsumerLambda', {
        deploymentEnvironment,
        stackBaseName
      });
  }

  public setupChain(successChain: Chain): GrantAccessToConsumerChain {
    const newChain = new GrantAccessToConsumerChain(this, 'GrantAccessToConsumerChain', {
      successChain,
      grantAccessToConsumerLambda: this.grantAccessToConsumerLambda.lambda
    });

    return newChain;
  }
}
