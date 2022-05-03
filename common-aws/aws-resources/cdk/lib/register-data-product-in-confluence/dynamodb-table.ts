import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { AttributeType, BillingMode, Table, StreamViewType } from '@aws-cdk/aws-dynamodb';
import { DeploymentEnvironment, DEV_DEPLOYMENT_ENVIRONMENT, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';

export type DataProductCatalogTableProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class DataProductCatalogTable extends Construct {
  /* AWS resources attached to this construct */
  public readonly dynamoTable: Table;

  private readonly partitionKey = 'data-product-name';

  public constructor(scope: Construct, id: string, props: DataProductCatalogTableProps) {
    super(scope, id);

    this.dynamoTable = this.setupDynamoDbTable(this, props);
  }

  private setupDynamoDbTable(
      scope: Construct, { stackBaseName, deploymentEnvironment }: DataProductCatalogTableProps
  ): Table {
    const dynamodbTableId = 'DataProductCatalogTable';
    const dynamoTableName = `${ stackBaseName }-${ dynamodbTableId }-${ deploymentEnvironment }`;
    const dynamoTable = new Table(scope, dynamodbTableId, {
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      partitionKey: {
        name: this.partitionKey,
        type: AttributeType.STRING
      },
      tableName: dynamoTableName,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: this.shouldRetainTable(deploymentEnvironment) ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY
    });

    return dynamoTable;
  }

  private shouldRetainTable(deploymentEnvironment: DeploymentEnvironment): boolean {
    return deploymentEnvironment === PROD_DEPLOYMENT_ENVIRONMENT
      || deploymentEnvironment === DEV_DEPLOYMENT_ENVIRONMENT;
  }
}
