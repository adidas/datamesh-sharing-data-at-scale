import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { RegisterDataProductInDynamoChain } from './chain';
import { RegisterDataProductInDynamoLambda } from './lambda';

export type RegisterDataProductInDynamoProps = {
  readonly dataProductCatalogTable: ITable;
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class RegisterDataProductInDynamo extends Construct {
  /* AWS resources attached to this construct */
  public readonly registerDataProductInDynamoLambda: RegisterDataProductInDynamoLambda;

  public constructor(scope: Construct, id: string, props: RegisterDataProductInDynamoProps) {
    super(scope, id);

    const { dataProductCatalogTable, deploymentEnvironment, stackBaseName } = props;

    this.registerDataProductInDynamoLambda =
      new RegisterDataProductInDynamoLambda(this, 'RegisterDataProductInDynamoLambda', {
        dataProductCatalogTable,
        deploymentEnvironment,
        stackBaseName
      });
  }

  public setupChain(failedChain: Chain, successChain: Chain): RegisterDataProductInDynamoChain {
    const newChain = new RegisterDataProductInDynamoChain(this, 'RegisterDataProductInDynamoChain', {
      registerDataProductInDynamoLambda: this.registerDataProductInDynamoLambda.lambda,
      failedChain,
      successChain
    });

    return newChain;
  }
}
