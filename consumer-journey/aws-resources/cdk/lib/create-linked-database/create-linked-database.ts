import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { CreateLinkedDatabaseChain } from './chain';
import { CreateLinkedDatabaseLambda } from './lambda';

export type CreateLinkedDatabaseProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class CreateLinkedDatabase extends Construct {
  /* AWS resources attached to this construct */
  public readonly createLinkedDatabaseLambda: CreateLinkedDatabaseLambda;

  public constructor(scope: Construct, id: string, props: CreateLinkedDatabaseProps) {
    super(scope, id);
    const { deploymentEnvironment, stackBaseName } = props;

    this.createLinkedDatabaseLambda =
      new CreateLinkedDatabaseLambda(this, 'CreateLinkedDatabaseLambda', {
        deploymentEnvironment,
        stackBaseName
      });
  }

  public setupChain(successChain: Chain): CreateLinkedDatabaseChain {
    const newChain = new CreateLinkedDatabaseChain(this, 'CreateLinkedLFDatabaseChain', {
      successChain,
      createLinkedDatabaseLambda: this.createLinkedDatabaseLambda.lambda
    });

    return newChain;
  }
}
