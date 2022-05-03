import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { ITable } from '@aws-cdk/aws-dynamodb';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { UpdateDataProductInDynamoChain } from './chain';
import { UpdateDataProductInDynamoLambda } from './lambda';

export type UpdateDataProductInDynamoProps = {
  readonly dataProductCatalogTable: ITable;
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class UpdateDataProductInDynamo extends Construct {
  /* AWS resources attached to this construct */
  public readonly updateDataProductInDynamoLambda: UpdateDataProductInDynamoLambda;

  public constructor(scope: Construct, id: string, props: UpdateDataProductInDynamoProps) {
    super(scope, id);

    const { dataProductCatalogTable, deploymentEnvironment, stackBaseName } = props;

    this.updateDataProductInDynamoLambda =
      new UpdateDataProductInDynamoLambda(this, 'UpdateDataProductInDynamoLambda', {
        dataProductCatalogTable,
        deploymentEnvironment,
        stackBaseName
      });
  }

  public setupChain(failedChain: Chain, successChain: Chain): UpdateDataProductInDynamoChain {
    const newChain = new UpdateDataProductInDynamoChain(this, 'UpdateDataProductInDynamoChain', {
      updateDataProductInDynamoLambda: this.updateDataProductInDynamoLambda.lambda,
      failedChain,
      successChain
    });

    return newChain;
  }
}
