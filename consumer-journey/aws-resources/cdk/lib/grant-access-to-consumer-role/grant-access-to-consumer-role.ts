import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { GrantAccessToConsumerRoleChain } from './chain';
import { GrantAccessToConsumerRoleLambda } from './lambda';

export type GrantAccessToConsumerRoleProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class GrantAccessToConsumerRole extends Construct {
  /* AWS resources attached to this construct */
  public readonly grantAccessToConsumerRoleLambda: GrantAccessToConsumerRoleLambda;

  public constructor(scope: Construct, id: string, props: GrantAccessToConsumerRoleProps) {
    super(scope, id);
    const { deploymentEnvironment, stackBaseName } = props;

    this.grantAccessToConsumerRoleLambda =
      new GrantAccessToConsumerRoleLambda(this, 'GrantAccessToConsumerRoleLambda', {
        deploymentEnvironment,
        stackBaseName
      });
  }

  public setupChain(successChain: Chain): GrantAccessToConsumerRoleChain {
    const newChain = new GrantAccessToConsumerRoleChain(this, 'GrantAccessToConsumerRoleChain', {
      successChain,
      grantAccessToConsumerRoleLambda: this.grantAccessToConsumerRoleLambda.lambda
    });

    return newChain;
  }
}
