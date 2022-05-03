import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { CreateGlueDatabaseChain } from './chain';
import { CreateGlueDatabasesLambda } from './lambda';

export type CreateGlueDatabasesProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class CreateGlueDatabases extends Construct {
  /* AWS resources attached to this construct */
  private readonly createGlueDatabasesLambda: CreateGlueDatabasesLambda;

  public constructor(scope: Construct, id: string, props: CreateGlueDatabasesProps) {
    super(scope, id);
    const { deploymentEnvironment, stackBaseName } = props;

    this.createGlueDatabasesLambda =
      new CreateGlueDatabasesLambda(this, 'CreateGlueDatabasesLambda', {
        deploymentEnvironment,
        stackBaseName
      });
  }

  public setupLFChain(successChain: Chain): CreateGlueDatabaseChain {
    const newChain = new CreateGlueDatabaseChain(this, 'CreateGlueLFDatabaseChain', {
      parallelFlowType: 'LF',
      successChain,
      createGlueDatabasesLambda: this.createGlueDatabasesLambda.lambda
    });

    return newChain;
  }

  public setupIamChain(successChain: Chain): CreateGlueDatabaseChain {
    const newChain = new CreateGlueDatabaseChain(this, 'CreateGlueIamDatabaseChain', {
      parallelFlowType: 'Iam',
      successChain,
      createGlueDatabasesLambda: this.createGlueDatabasesLambda.lambda
    });

    return newChain;
  }
}
