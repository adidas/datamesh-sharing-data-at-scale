import { Construct, Duration } from '@aws-cdk/core';
import { Code, Function } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import {
  GetDataProductS3Files, GetDataProductS3FilesProps
} from '../../../../cdk/lib/get-data-product-s3-file/lambda';

const timeoutSeconds = 10;
const memorySizeMB = 128;
const maxNameLength = 64;
const basicStackId = 'GetDataProductS3Files';
const lambdaId = basicStackId;
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const dataProductCatalogueBucket: any = { bucketName: 'dataProductCatalogueBucket' };
const mockedStack: any = jest.fn();
const addToRolePolicyMock = jest.fn();
const stackBaseProps: GetDataProductS3FilesProps = {
  deploymentEnvironment,
  stackBaseName,
  dataProductCatalogueBucket
};
const stackProps = {
  account: 'account',
  region: 'region'
};

jest.mock('@aws-cdk/core', () => ({
  Construct: jest.fn(), Stack: { of: jest.fn(() => stackProps) },
  Duration: { seconds: jest.fn().mockReturnValue('mock') }
}));
jest.mock('@aws-cdk/aws-lambda', () => ({
  Function: jest.fn(() => ({ addToRolePolicy: addToRolePolicyMock })),
  Code: { fromAsset: jest.fn().mockReturnValue('mock') },
  Runtime: { NODEJS_14_X: 'NODEJS_14_X' }
}));
jest.mock('@aws-cdk/aws-iam', () => ({ PolicyStatement: jest.fn() }));

describe('# GetDataProductS3Files Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new lambda successfully', (done) => {
    const construct = new GetDataProductS3Files(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledWith(construct, lambdaId, {
      runtime: 'NODEJS_14_X',
      code: 'mock',
      handler: 'index.getDataProductS3FilesHandler',
      description: 'Reads all data products assets files from s3 and returns their values',
      timeout: 'mock',
      environment: {
        LOGGER_LEVEL: 'info',
        BUCKET_NAME: dataProductCatalogueBucket.bucketName
      },
      functionName: `${ stackBaseName }-${ lambdaId }-${ deploymentEnvironment }`
        .substring(0, maxNameLength),
      memorySize: memorySizeMB,
      logRetention: 7
    });
    expect(Code.fromAsset).toHaveBeenCalledTimes(1);
    expect(Code.fromAsset).toHaveBeenCalledWith(
      './common-aws/get-data-product-s3-files-lambda/dist'
    );
    expect(Duration.seconds).toHaveBeenCalledTimes(1);
    expect(Duration.seconds).toHaveBeenCalledWith(timeoutSeconds);

    done();
  });

  it('Should create the proper iam actions to the lambda successfully', (done) => {
    new GetDataProductS3Files(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(addToRolePolicyMock).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledWith({
      actions: [ 's3:ListBucket', 's3:GetObject' ],
      resources: [
        `arn:aws:s3:::${ dataProductCatalogueBucket.bucketName }`,
        `arn:aws:s3:::${ dataProductCatalogueBucket.bucketName }/*`
      ]
    });

    done();
  });
});
