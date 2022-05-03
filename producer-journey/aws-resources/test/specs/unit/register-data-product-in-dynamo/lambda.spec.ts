import { Construct, Duration } from '@aws-cdk/core';
import { Code, Function } from '@aws-cdk/aws-lambda';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  RegisterDataProductInDynamoLambda, RegisterDataProductInDynamoLambdaProps
} from '../../../../cdk/lib/register-data-product-in-dynamo/lambda';

const timeoutSeconds = 20;
const memorySizeMB = 128;
const maxNameLength = 64;
const basicStackId = 'RegisterDataProductInDynamoLambda';
const lambdaId = 'RegisterDataProductInDynamo';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const dataProductCatalogTable: any = {
  tableName: 'tableName',
  grantWriteData: jest.fn()
};
const mockedStack: any = jest.fn();
const stackBaseProps: RegisterDataProductInDynamoLambdaProps = {
  dataProductCatalogTable,
  deploymentEnvironment,
  stackBaseName
};

jest.mock('@aws-cdk/core', () => ({
  Construct: jest.fn(),
  Duration: { seconds: jest.fn().mockReturnValue('mock') }
}));
jest.mock('@aws-cdk/aws-lambda', () => ({
  Function: jest.fn(),
  Code: { fromAsset: jest.fn().mockReturnValue('mock') },
  Runtime: { NODEJS_14_X: 'NODEJS_14_X' }
}));

describe('# RegisterDataProductInDynamoLambda Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new lambda successfully', (done) => {
    const construct = new RegisterDataProductInDynamoLambda(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledWith(construct, lambdaId, {
      runtime: 'NODEJS_14_X',
      code: 'mock',
      handler: 'index.registerDataProductInDynamoHandler',
      description: 'Registers a data product in the catalog dynamodb table',
      timeout: 'mock',
      environment: {
        LOGGER_LEVEL: 'info',
        DYNAMODB_TABLE_NAME: dataProductCatalogTable.tableName
      },
      functionName: `${ stackBaseName }-${ lambdaId }-${ deploymentEnvironment }`
        .substring(0, maxNameLength),
      memorySize: memorySizeMB,
      logRetention: 7
    });
    expect(Code.fromAsset).toHaveBeenCalledTimes(1);
    expect(Code.fromAsset).toHaveBeenCalledWith(
      './producer-journey/register-data-product-in-dynamo-lambda/dist'
    );
    expect(Duration.seconds).toHaveBeenCalledTimes(1);
    expect(Duration.seconds).toHaveBeenCalledWith(timeoutSeconds);

    done();
  });

  it('Should create the proper iam actions to the lambda successfully', (done) => {
    new RegisterDataProductInDynamoLambda(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(dataProductCatalogTable.grantWriteData).toHaveBeenCalledTimes(1);
    expect(dataProductCatalogTable.grantWriteData).toHaveBeenCalledWith(
      getMockObject(Function).mock.instances[0]
    );

    done();
  });
});
