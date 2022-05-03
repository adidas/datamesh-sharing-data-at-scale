import { Construct, Duration } from '@aws-cdk/core';
import { Code, Function } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import {
  UpdateGlueCatalogPolicyLambda, UpdateGlueCatalogPolicyLambdaProps
} from '../../../../cdk/lib/update-glue-catalog-policy/lambda';

const timeoutSeconds = 30;
const memorySizeMB = 128;
const maxNameLength = 64;
const basicStackId = 'UpdateGlueCatalogPolicyLambda';
const lambdaId = basicStackId;
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const mockedStack: any = jest.fn();
const addToRolePolicyMock = jest.fn();
const stackBaseProps: UpdateGlueCatalogPolicyLambdaProps = {
  deploymentEnvironment,
  stackBaseName
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

describe('# UpdateGlueCatalogPolicyLambda Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new lambda successfully', (done) => {
    const construct = new UpdateGlueCatalogPolicyLambda(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledWith(construct, lambdaId, {
      reservedConcurrentExecutions: 1,
      runtime: 'NODEJS_14_X',
      code: 'mock',
      handler: 'index.updateGlueCatalogPolicyHandler',
      description: 'Updates glue catalog policy settings for sharing it with a new account',
      timeout: 'mock',
      environment: {
        LOGGER_LEVEL: 'info',
        ACCOUNT_ID: stackProps.account,
        REGION: stackProps.region
      },
      functionName: `${ stackBaseName }-${ lambdaId }-${ deploymentEnvironment }`
        .substring(0, maxNameLength),
      memorySize: memorySizeMB,
      logRetention: 7
    });
    expect(Code.fromAsset).toHaveBeenCalledTimes(1);
    expect(Code.fromAsset).toHaveBeenCalledWith(
      './common-aws/update-glue-catalog-policy-lambda/dist'
    );
    expect(Duration.seconds).toHaveBeenCalledTimes(1);
    expect(Duration.seconds).toHaveBeenCalledWith(timeoutSeconds);

    done();
  });

  it('Should create the proper iam actions to the lambda successfully', (done) => {
    new UpdateGlueCatalogPolicyLambda(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(addToRolePolicyMock).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledWith({
      actions: [ 'glue:GetResourcePolicy', 'glue:PutResourcePolicy' ],
      resources: [ '*' ]
    });

    done();
  });
});
