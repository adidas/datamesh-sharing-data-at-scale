import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { AssignDefaultLFTagsToDatabaseChain } from '../../../../cdk/lib/assign-default-lf-tags-to-database/chain';
import { AssignDefaultLFTagsToDatabaseLambda } from '../../../../cdk/lib/assign-default-lf-tags-to-database/lambda';
import {
  AssignDefaultLFTagsToDatabase, AssignDefaultLFTagsToDatabaseProps
} from '../../../../cdk/lib/assign-default-lf-tags-to-database/assign-default-lf-tags-to-database';

const basicStackId = 'AssignDefaultLFTagsToDatabase';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const stackBaseProps: AssignDefaultLFTagsToDatabaseProps = {
  deploymentEnvironment,
  stackBaseName
};
const lambdaMock = jest.fn();

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/assign-default-lf-tags-to-database/lambda', () => ({
  AssignDefaultLFTagsToDatabaseLambda: jest.fn(() => ({ lambda: lambdaMock }))
}));
jest.mock('../../../../cdk/lib/assign-default-lf-tags-to-database/chain', () => ({
  AssignDefaultLFTagsToDatabaseChain: jest.fn() }));

describe('# AssignDefaultLFTagsToDatabase', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new AssignDefaultLFTagsToDatabase(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a AssignDefaultLFTagsToDatabaseLambda construct', (done) => {
    const constructId = 'AssignDefaultLFTagsToDatabaseLambda';
    const construct = new AssignDefaultLFTagsToDatabase(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(AssignDefaultLFTagsToDatabaseLambda).toHaveBeenCalledTimes(1);
    expect(AssignDefaultLFTagsToDatabaseLambda).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a AssignDefaultLFTagsToDatabaseChain construct', (done) => {
    const constructId = 'AssignDefaultLFTagsToDatabaseChain';
    const construct = new AssignDefaultLFTagsToDatabase(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupChain(successChain);

    expect(AssignDefaultLFTagsToDatabaseChain).toHaveBeenCalledTimes(1);
    expect(AssignDefaultLFTagsToDatabaseChain).toHaveBeenCalledWith(construct, constructId, {
      assignDefaultLFTagsToDatabaseLambda: lambdaMock, successChain
    });
    expect(newChain).toEqual(getMockObject(AssignDefaultLFTagsToDatabaseChain).mock.instances[0]);

    done();
  });
});
