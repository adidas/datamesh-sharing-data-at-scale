import { Construct, Duration } from '@aws-cdk/core';
import { Code, Function } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { DataProductAssetsCRLambda, DataProductAssetsCRLambdaProps } from '../../../../../cdk/lib/catalogue-assets-main-stack/lambda';

const timeoutSeconds = 30;
const memorySizeMB = 192;
const maxNameLength = 64;
const basicStackId = 'DataProductAssetsCRLambda';
const lambdaId = 'DataProductAssetCustomResource';
const stackBaseName = 'stackBaseName';
const deploymentEnvironment = 'dev';
const mockedStack: any = jest.fn();
const dataProductCatalogueEventBusMock: any = {
  eventBusArn: 'eventBusArn'
};
const addToRolePolicyMock = jest.fn();
const dataProductCatalogueBucketMock: any = { bucketName: 'bucketName', bucketArn: 'bucketArn' };
const stackBaseProps: DataProductAssetsCRLambdaProps = {
  deploymentEnvironment,
  stackBaseName,
  dataProductCatalogueEventBus: dataProductCatalogueEventBusMock,
  dataProductCatalogueBucket: dataProductCatalogueBucketMock
};

jest.mock('@aws-cdk/core', () => ({
  Construct: jest.fn(),
  Duration: { seconds: jest.fn().mockReturnValue('mock') }
}));
jest.mock('@aws-cdk/aws-lambda', () => ({
  Function: jest.fn(() => ({ addToRolePolicy: addToRolePolicyMock })),
  Code: { fromAsset: jest.fn().mockReturnValue('mock') },
  Runtime: { NODEJS_14_X: 'NODEJS_14_X' }
}));
jest.mock('@aws-cdk/aws-iam', () => ({ PolicyStatement: jest.fn() }));

describe('# DataProductAssetsCRLambda Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new lambda successfully', (done) => {
    const construct = new DataProductAssetsCRLambda(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledWith(construct, lambdaId, {
      runtime: 'NODEJS_14_X',
      code: 'mock',
      handler: 'index.dataProductAssetHandler',
      description: 'Create a data product asset on a s3 bucket',
      timeout: 'mock',
      environment: {
        LOGGER_LEVEL: 'info',
        BUCKET_NAME: 'bucketName',
        EVENT_BUS: 'eventBusArn'
      },
      functionName: `${ stackBaseName }-${ lambdaId }-${ deploymentEnvironment }`
        .substring(0, maxNameLength),
      memorySize: memorySizeMB,
      logRetention: 7
    });
    expect(Code.fromAsset).toHaveBeenCalledTimes(1);
    expect(Code.fromAsset).toHaveBeenCalledWith(
      './data-product-assets-setup/data-product-asset-lambda/dist'
    );
    expect(Duration.seconds).toHaveBeenCalledTimes(1);
    expect(Duration.seconds).toHaveBeenCalledWith(timeoutSeconds);

    done();
  });

  it('Should create the proper iam actions to the lambda successfully', (done) => {
    new DataProductAssetsCRLambda(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(addToRolePolicyMock).toHaveBeenCalledTimes(2);
    expect(PolicyStatement).toHaveBeenCalledTimes(2);
    expect(PolicyStatement).toHaveBeenNthCalledWith(1, {
      actions: [ 's3:*' ],
      resources: [ 'bucketArn', 'bucketArn/*' ]
    });
    expect(PolicyStatement).toHaveBeenNthCalledWith(2, {
      actions: [ 'events:PutEvents' ],
      resources: [ 'eventBusArn' ]
    });

    done();
  });
});
