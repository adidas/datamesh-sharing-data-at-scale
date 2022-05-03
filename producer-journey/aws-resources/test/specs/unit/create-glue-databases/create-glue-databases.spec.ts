import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { CreateGlueDatabaseChain } from '../../../../cdk/lib/create-glue-databases/chain';
import { CreateGlueDatabasesLambda } from '../../../../cdk/lib/create-glue-databases/lambda';
import {
  CreateGlueDatabases, CreateGlueDatabasesProps
} from '../../../../cdk/lib/create-glue-databases/create-glue-databases';

const basicStackId = 'CreateGlueDatabases';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const stackBaseProps: CreateGlueDatabasesProps = {
  deploymentEnvironment,
  stackBaseName
};
const lambdaMock = jest.fn();

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/create-glue-databases/lambda', () => ({
  CreateGlueDatabasesLambda: jest.fn(() => ({ lambda: lambdaMock }))
}));
jest.mock('../../../../cdk/lib/create-glue-databases/chain', () => ({
  CreateGlueDatabaseChain: jest.fn() }));

describe('# CreateGlueDatabases', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new CreateGlueDatabases(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a CreateGlueDatabasesLambda construct', (done) => {
    const constructId = 'CreateGlueDatabasesLambda';
    const construct = new CreateGlueDatabases(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(CreateGlueDatabasesLambda).toHaveBeenCalledTimes(1);
    expect(CreateGlueDatabasesLambda).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a CreateGlueLFDatabaseChain construct', (done) => {
    const constructId = 'CreateGlueLFDatabaseChain';
    const construct = new CreateGlueDatabases(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupLFChain(successChain);

    expect(CreateGlueDatabaseChain).toHaveBeenCalledTimes(1);
    expect(CreateGlueDatabaseChain).toHaveBeenCalledWith(construct, constructId, {
      createGlueDatabasesLambda: lambdaMock, successChain, parallelFlowType: 'LF'
    });
    expect(newChain).toEqual(getMockObject(CreateGlueDatabaseChain).mock.instances[0]);

    done();
  });

  it('Should have a CreateGlueIamDatabaseChain construct', (done) => {
    const constructId = 'CreateGlueIamDatabaseChain';
    const construct = new CreateGlueDatabases(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupIamChain(successChain);

    expect(CreateGlueDatabaseChain).toHaveBeenCalledTimes(1);
    expect(CreateGlueDatabaseChain).toHaveBeenCalledWith(construct, constructId, {
      createGlueDatabasesLambda: lambdaMock, successChain, parallelFlowType: 'Iam'
    });
    expect(newChain).toEqual(getMockObject(CreateGlueDatabaseChain).mock.instances[0]);

    done();
  });
});
