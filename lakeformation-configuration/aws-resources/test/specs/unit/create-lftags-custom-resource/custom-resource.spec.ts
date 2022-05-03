import { Function as LambdaFunction, Code } from '@aws-cdk/aws-lambda';
import { Construct, CustomResource, Duration } from '@aws-cdk/core';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import {
  CreateLfTagsCustomResource, CreateLfTagsCustomResourceProps
} from '../../../../cdk/lib/create-lf-tags-custom-resource/custom-resource';
import defaultConfig from '../../../../cdk/lib/create-lf-tags-custom-resource/config/lambdas.config.default.json';
import devConfig from '../../../../cdk/lib/create-lf-tags-custom-resource/config/lambdas.config.dev.json';
import lfDefaultTags from '../../../../cdk/lib/create-lf-tags-custom-resource/config/lake-formation-tags.default.json';

const createLfTagsCustomResourceId = 'CreateLfTagsCustomResource';
const mockedStack: any = jest.fn();
const dataLakeAdminRoleMock: any = { roleName: 'roleName', roleArn: 'roleArn' };
const deploymentEnvironment = 'dev';
const accountId = 'accountId';
const config = { ...defaultConfig, ...devConfig };
const createLfTagsCustomResourceProps: CreateLfTagsCustomResourceProps = {
  deploymentEnvironment,
  accountId,
  dataLakeAdminRole: dataLakeAdminRoleMock

};
const addToRolePolicyMock = jest.fn();
const lambdaId = 'CreateLfTagsCustomResource';
const lambdaPath = './lakeformation-configuration/create-lf-tags-lambda/dist';

jest.mock('@aws-cdk/core', () => ({
  Construct: jest.fn(), CustomResource: jest.fn(), Duration: { seconds: jest.fn() } }));
jest.mock('@aws-cdk/aws-lambda', () => ({
  Function: jest.fn(() => ({ addToRolePolicy: addToRolePolicyMock, functionArn: 'functionArn' })),
  Code: { fromAsset: jest.fn() }, Runtime: { NODEJS_14_X: 'NODEJS_14_X' }
}));
jest.mock('@aws-cdk/aws-iam', () => ({ PolicyStatement: jest.fn() }));

describe('# CreateLfTagsCustomResource', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new CreateLfTagsCustomResource(
      mockedStack, createLfTagsCustomResourceId, createLfTagsCustomResourceProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Construct).toHaveBeenCalledWith(mockedStack, createLfTagsCustomResourceId);
    expect(Code.fromAsset).toHaveBeenCalledTimes(1);
    expect(Duration.seconds).toHaveBeenCalledTimes(1);
    expect(LambdaFunction).toHaveBeenCalledTimes(1);
    expect(CustomResource).toHaveBeenCalledTimes(3);

    done();
  });

  it('Should create a LambdaFunction', (done) => {
    const createLfTagsCustomResource = new CreateLfTagsCustomResource(
      mockedStack, createLfTagsCustomResourceId, createLfTagsCustomResourceProps
    );

    expect(Code.fromAsset).toHaveBeenCalledWith(lambdaPath);
    expect(Duration.seconds).toHaveBeenCalledWith(config.Lambda.TimeoutSeconds);
    expect(LambdaFunction).toHaveBeenCalledWith(
      createLfTagsCustomResource, `${ lambdaId }-Function`, {
        description: 'Create Default Lake Formation Tags in governance account',
        code: (Code.fromAsset as unknown as jest.Mock).mock.results[0].value,
        handler: 'index.createLfTagsHandler',
        runtime: 'NODEJS_14_X',
        environment: {
          LOGGER_LEVEL: config.Logging.LogLevel,
          DATA_LAKE_ADMIN_ROLE_SESSION_NAME: 'roleName',
          ACCOUNT_ID: accountId
        },
        functionName: `${ lambdaId }-${ deploymentEnvironment }`,
        timeout: (Duration.seconds as unknown as jest.Mock).mock.results[0].value,
        memorySize: config.Lambda.MemorySizeMB,
        logRetention: config.Logging.RetentionInDays
      }
    );

    done();
  });

  it('Should create the proper iam actions to the lambda successfully', (done) => {
    new CreateLfTagsCustomResource(
      mockedStack, createLfTagsCustomResourceId, createLfTagsCustomResourceProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(addToRolePolicyMock).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledWith({
      actions: [ 'sts:AssumeRole' ],
      resources: [ 'roleArn' ]
    });

    done();
  });

  it('Should create a VisibilityCustomResource', (done) => {
    const createLfTagsCustomResource = new CreateLfTagsCustomResource(
      mockedStack, createLfTagsCustomResourceId, createLfTagsCustomResourceProps
    );

    expect(CustomResource).toHaveBeenCalledTimes(3);
    expect(CustomResource).toHaveBeenCalledWith(
      createLfTagsCustomResource, `${ lambdaId }-${ lfDefaultTags[0].TagKey }`, {
        resourceType: 'Custom::CreateLfTag',
        serviceToken: 'functionArn',
        properties: {
          Tag: lfDefaultTags[0]
        }
      }
    );

    done();
  });

  it('Should create a PiiCustomResource', (done) => {
    const createLfTagsCustomResource = new CreateLfTagsCustomResource(
      mockedStack, createLfTagsCustomResourceId, createLfTagsCustomResourceProps
    );

    expect(CustomResource).toHaveBeenCalledWith(
      createLfTagsCustomResource, `${ lambdaId }-${ lfDefaultTags[1].TagKey }`, {
        resourceType: 'Custom::CreateLfTag',
        serviceToken: 'functionArn',
        properties: {
          Tag: lfDefaultTags[1]
        }
      }
    );

    done();
  });

  it('Should create a PciCustomResource', (done) => {
    const createLfTagsCustomResource = new CreateLfTagsCustomResource(
      mockedStack, createLfTagsCustomResourceId, createLfTagsCustomResourceProps
    );

    expect(CustomResource).toHaveBeenCalledWith(
      createLfTagsCustomResource, `${ lambdaId }-${ lfDefaultTags[2].TagKey }`, {
        resourceType: 'Custom::CreateLfTag',
        serviceToken: 'functionArn',
        properties: {
          Tag: lfDefaultTags[2]
        }
      }
    );

    done();
  });
});
