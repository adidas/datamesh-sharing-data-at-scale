import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { RegisterS3LocationChain } from '../../../../cdk/lib/register-location/chain';
import { RegisterS3LocationLambda } from '../../../../cdk/lib/register-location/lambda';
import {
  RegisterS3LocationProps, RegisterS3Location
} from '../../../../cdk/lib/register-location/register-location';

const basicStackId = 'RegisterS3Location';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const stackBaseProps: RegisterS3LocationProps = {
  deploymentEnvironment,
  stackBaseName
};
const lambdaMock = jest.fn();

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/register-location/lambda', () => ({
  RegisterS3LocationLambda: jest.fn(() => ({ lambda: lambdaMock }))
}));
jest.mock('../../../../cdk/lib/register-location/chain', () => ({
  RegisterS3LocationChain: jest.fn() }));

describe('# RegisterS3Location', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new RegisterS3Location(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a RegisterS3LocationLambda construct', (done) => {
    const constructId = 'RegisterS3LocationLambda';
    const construct = new RegisterS3Location(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(RegisterS3LocationLambda).toHaveBeenCalledTimes(1);
    expect(RegisterS3LocationLambda).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a RegisterS3LocationChain construct', (done) => {
    const constructId = 'RegisterS3LocationChain';
    const construct = new RegisterS3Location(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupChain(failedChain, successChain);

    expect(RegisterS3LocationChain).toHaveBeenCalledTimes(1);
    expect(RegisterS3LocationChain).toHaveBeenCalledWith(construct, constructId, {
      registerS3LocationLambda: lambdaMock, failedChain, successChain
    });
    expect(newChain).toEqual(getMockObject(RegisterS3LocationChain).mock.instances[0]);

    done();
  });
});
