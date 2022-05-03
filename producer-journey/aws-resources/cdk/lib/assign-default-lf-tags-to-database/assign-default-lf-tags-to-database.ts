import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { AssignDefaultLFTagsToDatabaseChain } from './chain';
import { AssignDefaultLFTagsToDatabaseLambda } from './lambda';

export type AssignDefaultLFTagsToDatabaseProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class AssignDefaultLFTagsToDatabase extends Construct {
  /* AWS resources attached to this construct */
  private readonly assignDefaultLFTagsToDatabaseLambda: AssignDefaultLFTagsToDatabaseLambda;

  public constructor(scope: Construct, id: string, props: AssignDefaultLFTagsToDatabaseProps) {
    super(scope, id);
    const { deploymentEnvironment, stackBaseName } = props;

    this.assignDefaultLFTagsToDatabaseLambda =
      new AssignDefaultLFTagsToDatabaseLambda(this, 'AssignDefaultLFTagsToDatabaseLambda', {
        deploymentEnvironment,
        stackBaseName
      });
  }

  public setupChain(successChain: Chain): AssignDefaultLFTagsToDatabaseChain {
    const newChain = new AssignDefaultLFTagsToDatabaseChain(this, 'AssignDefaultLFTagsToDatabaseChain', {
      successChain,
      assignDefaultLFTagsToDatabaseLambda: this.assignDefaultLFTagsToDatabaseLambda.lambda
    });

    return newChain;
  }
}
