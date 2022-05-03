import { Construct, Duration } from '@aws-cdk/core';
import { Code, Function } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  UpdateDataProductInDynamoLambda, UpdateDataProductInDynamoLambdaProps
} from '../../../../cdk/lib/update-data-product-in-dynamo/lambda';

const timeoutSeconds = 20;
const memorySizeMB = 128;
const maxNameLength = 64;
const basicStackId = 'UpdateDataProductInDynamoLambda';
const lambdaId = 'UpdateDataProductInDynamo';
const deploymentEnvironment = 'dev';
const lakeFormationAdminRoleName = 'data-lake-administrator-dev';
const stackBaseName = 'stackBaseName';
const dataProductCatalogTable: any = {
  tableName: 'tableName',
  grantWriteData: jest.fn()
};
const mockedStack: any = jest.fn();
const addToRolePolicyMock = jest.fn();
const stackBaseProps: UpdateDataProductInDynamoLambdaProps = {
  dataProductCatalogTable,
  deploymentEnvironment,
  stackBaseName
};

jest.mock('@aws-cdk/core', () => ({
  Construct: jest.fn(), Stack: { of: jest.fn(() => ({ account: 'accountId' })) },
  Duration: { seconds: jest.fn().mockReturnValue('mock') }
}));
jest.mock('@aws-cdk/aws-lambda', () => ({
  Function: jest.fn(() => ({ addToRolePolicy: addToRolePolicyMock })),
  Code: { fromAsset: jest.fn().mockReturnValue('mock') },
  Runtime: { NODEJS_14_X: 'NODEJS_14_X' }
}));
jest.mock('@aws-cdk/aws-iam', () => ({ PolicyStatement: jest.fn() }));

describe('# UpdateDataProductInDynamoLambda Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new lambda successfully', (done) => {
    const construct = new UpdateDataProductInDynamoLambda(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledWith(construct, lambdaId, {
      runtime: 'NODEJS_14_X',
      code: 'mock',
      handler: 'index.updateDataProductInDynamoHandler',
      description: 'Updates a data product from dynamo db table with visibility json object properties',
      timeout: 'mock',
      environment: {
        LOGGER_LEVEL: 'info',
        DYNAMODB_TABLE_NAME: dataProductCatalogTable.tableName,
        DATA_LAKE_ADMIN_ROLE_SESSION_NAME: lakeFormationAdminRoleName,
        ACCOUNT_ID: 'accountId'
      },
      functionName: `${ stackBaseName }-${ lambdaId }-${ deploymentEnvironment }`
        .substring(0, maxNameLength),
      memorySize: memorySizeMB,
      logRetention: 7
    });
    expect(Code.fromAsset).toHaveBeenCalledTimes(1);
    expect(Code.fromAsset).toHaveBeenCalledWith(
      './visibility-journey/update-data-product-in-dynamo-lambda/dist'
    );
    expect(Duration.seconds).toHaveBeenCalledTimes(1);
    expect(Duration.seconds).toHaveBeenCalledWith(timeoutSeconds);

    done();
  });

  it('Should create the proper iam actions to the lambda successfully', (done) => {
    new UpdateDataProductInDynamoLambda(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(addToRolePolicyMock).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledWith({
      actions: [ 'iam:PassRole', 'sts:AssumeRole', 'iam:GetRole' ],
      resources: [ `arn:aws:iam::accountId:role/${ lakeFormationAdminRoleName }` ]
    });
    expect(dataProductCatalogTable.grantWriteData).toHaveBeenCalledTimes(1);
    expect(dataProductCatalogTable.grantWriteData).toHaveBeenCalledWith(
      getMockObject(Function).mock.results[0].value
    );

    done();
  });
});
