import { Construct, Duration } from '@aws-cdk/core';
import { Code, Function } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import {
  AssignDefaultLFTagsToDatabaseLambda, AssignDefaultLFTagsToDatabaseLambdaProps
} from '../../../../cdk/lib/assign-default-lf-tags-to-database/lambda';

const timeoutSeconds = 10;
const memorySizeMB = 128;
const maxNameLength = 64;
const basicStackId = 'AssignDefaultLFTagsToDatabaseLambda';
const lambdaId = 'AssignDefaultLFTagsToDatabase';
const lakeFormationAdminRoleName = 'data-lake-administrator-dev';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const mockedStack: any = jest.fn();
const addToRolePolicyMock = jest.fn();
const stackBaseProps: AssignDefaultLFTagsToDatabaseLambdaProps = {
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

describe('# AssignDefaultLFTagsToDatabaseLambda Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new lambda successfully', (done) => {
    const construct = new AssignDefaultLFTagsToDatabaseLambda(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledWith(construct, lambdaId, {
      runtime: 'NODEJS_14_X',
      code: 'mock',
      handler: 'index.assignDefaultLFTagsToDatabaseHandler',
      description: 'Assigns default lake formation tags values to a data product database',
      timeout: 'mock',
      environment: {
        LOGGER_LEVEL: 'info',
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
      './producer-journey/assign-default-lf-tags-to-database-lambda/dist'
    );
    expect(Duration.seconds).toHaveBeenCalledTimes(1);
    expect(Duration.seconds).toHaveBeenCalledWith(timeoutSeconds);

    done();
  });

  it('Should create the proper iam actions to the lambda successfully', (done) => {
    new AssignDefaultLFTagsToDatabaseLambda(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(addToRolePolicyMock).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledWith({
      actions: [ 'sts:AssumeRole' ],
      resources: [ `arn:aws:iam::accountId:role/${ lakeFormationAdminRoleName }` ]
    });

    done();
  });
});
