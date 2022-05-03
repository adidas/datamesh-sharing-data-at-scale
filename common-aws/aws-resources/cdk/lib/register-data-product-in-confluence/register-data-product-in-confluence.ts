import { Construct } from '@aws-cdk/core';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { DataProductCatalogTable } from './dynamodb-table';

export type RegisterDataProductInConfluenceProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class RegisterDataProductInConfluence extends Construct {
  /* AWS resources attached to this construct */
  public readonly dataProductCatalogTable: DataProductCatalogTable;

  public constructor(scope: Construct, id: string, props: RegisterDataProductInConfluenceProps) {
    super(scope, id);

    const { deploymentEnvironment, stackBaseName } = props;

    this.dataProductCatalogTable = new DataProductCatalogTable(this, 'DataProductCatalogTable', {
      deploymentEnvironment,
      stackBaseName
    });
  }
}
