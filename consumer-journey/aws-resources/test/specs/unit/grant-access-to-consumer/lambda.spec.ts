import { Construct, Duration } from '@aws-cdk/core';
import { Code, Function } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import {
  GrantAccessToConsumerLambda,
  GrantAccessToConsumerLambdaProps
} from '../../../../cdk/lib/grant-access-to-consumer/lambda';

const timeoutSeconds = 10;
const memorySizeMB = 128;
const maxNameLength = 64;
const basicStackId = 'GrantAccessToConsumerLambda';
const lambdaId = 'GrantAccessToConsumer';
const accountId = 'accountId';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const adminRole = 'data-lake-administrator-dev';
const mockedStack: any = jest.fn();
const addToRolePolicyMock = jest.fn();
const stackBaseProps: GrantAccessToConsumerLambdaProps = {
  deploymentEnvironment,
  stackBaseName
};

jest.mock('@aws-cdk/core', () => ({
  Construct: jest.fn(),
  Duration: { seconds: jest.fn().mockReturnValue('mock') },
  Stack: { of: jest.fn(() => ({ account: accountId })) }
}));
jest.mock('@aws-cdk/aws-lambda', () => ({
  Function: jest.fn(() => ({ addToRolePolicy: addToRolePolicyMock })),
  Code: { fromAsset: jest.fn().mockReturnValue('mock') },
  Runtime: { NODEJS_14_X: 'NODEJS_14_X' }
}));
jest.mock('@aws-cdk/aws-iam', () => ({ PolicyStatement: jest.fn() }));

describe('# GrantAccessToConsumerLambda Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new lambda successfully', (done) => {
    const construct = new GrantAccessToConsumerLambda(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledWith(construct, lambdaId, {
      runtime: 'NODEJS_14_X',
      code: 'mock',
      handler: 'index.grantAccessToConsumerHandler',
      description: 'Grant read and write access to the new data product to the consumer',
      timeout: 'mock',
      environment: {
        LOGGER_LEVEL: 'info',
        DATA_LAKE_ADMIN_ROLE_SESSION_NAME: adminRole,
        ACCOUNT_ID: accountId
      },
      functionName: `${ stackBaseName }-${ lambdaId }-${ deploymentEnvironment }`
        .substring(0, maxNameLength),
      memorySize: memorySizeMB,
      logRetention: 7
    });
    expect(Code.fromAsset).toHaveBeenCalledTimes(1);
    expect(Code.fromAsset).toHaveBeenCalledWith(
      './consumer-journey/grant-access-to-consumer-lambda/dist'
    );
    expect(Duration.seconds).toHaveBeenCalledTimes(1);
    expect(Duration.seconds).toHaveBeenCalledWith(timeoutSeconds);

    done();
  });

  it('Should create the proper iam actions to the lambda successfully', (done) => {
    new GrantAccessToConsumerLambda(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(addToRolePolicyMock).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledWith({
      actions: [ 'sts:AssumeRole' ],
      resources: [ `arn:aws:iam::${ accountId }:role/${ adminRole }` ]
    });

    done();
  });
});
