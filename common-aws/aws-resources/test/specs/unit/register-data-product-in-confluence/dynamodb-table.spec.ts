import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { AttributeType, BillingMode, StreamViewType, Table } from '@aws-cdk/aws-dynamodb';
import {
  DataProductCatalogTable, DataProductCatalogTableProps
} from '../../../../cdk/lib/register-data-product-in-confluence/dynamodb-table';

const basicStackId = 'DataProductCatalogTable';
const dynamodbTableId = basicStackId;
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const partitionKey = 'data-product-name';
const dynamoTableName = `${ stackBaseName }-${ dynamodbTableId }-${ deploymentEnvironment }`;
const mockedStack: any = jest.fn();
const stackBaseProps: DataProductCatalogTableProps = {
  deploymentEnvironment,
  stackBaseName
};

jest.mock('@aws-cdk/core', () => ({
  ...jest.requireActual('@aws-cdk/core'),
  Construct: jest.fn()
}));
jest.mock('@aws-cdk/aws-dynamodb', () => ({
  ...jest.requireActual('@aws-cdk/aws-dynamodb'),
  Table: jest.fn()
}));

describe('# DataProductCatalogTable Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new table successfully for prod or dev environment', (done) => {
    const construct = new DataProductCatalogTable(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Table).toHaveBeenCalledTimes(1);
    expect(Table).toHaveBeenCalledWith(construct, dynamodbTableId, {
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      partitionKey: {
        name: partitionKey,
        type: AttributeType.STRING
      },
      tableName: dynamoTableName,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN
    });

    done();
  });

  it('Should create a new table successfully for feature environment', (done) => {
    const newDeploymentEnvironment = 'adidas-123';
    const construct = new DataProductCatalogTable(
      mockedStack, basicStackId, {
        ...stackBaseProps,
        deploymentEnvironment: newDeploymentEnvironment
      }
    );

    const newdynamoTableName = `${ stackBaseName }-${ dynamodbTableId }-${ newDeploymentEnvironment }`;

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Table).toHaveBeenCalledTimes(1);
    expect(Table).toHaveBeenCalledWith(construct, dynamodbTableId, {
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      partitionKey: {
        name: partitionKey,
        type: AttributeType.STRING
      },
      tableName: newdynamoTableName,
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });

    done();
  });
});
