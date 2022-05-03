import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { AssignVisibilityFileLFTagsChain } from '../../../../cdk/lib/assign-visibility-file-lf-tags/chain';
import { AssignVisibilityFileLFTagsLambda } from '../../../../cdk/lib/assign-visibility-file-lf-tags/lambda';
import {
  AssignVisibilityFileLFTags, AssignVisibilityFileLFTagsProps
} from '../../../../cdk/lib/assign-visibility-file-lf-tags/assign-visibility-file-lf-tags';

const basicStackId = 'AssignVisibilityFileLFTags';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const stackBaseProps: AssignVisibilityFileLFTagsProps = {
  deploymentEnvironment,
  stackBaseName
};
const lambdaMock = jest.fn();

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/assign-visibility-file-lf-tags/lambda', () => ({
  AssignVisibilityFileLFTagsLambda: jest.fn(() => ({ lambda: lambdaMock }))
}));
jest.mock('../../../../cdk/lib/assign-visibility-file-lf-tags/chain', () => ({
  AssignVisibilityFileLFTagsChain: jest.fn() }));

describe('# AssignVisibilityFileLFTags', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new AssignVisibilityFileLFTags(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a AssignVisibilityFileLFTagsLambda construct', (done) => {
    const constructId = 'AssignVisibilityFileLFTagsLambda';
    const construct = new AssignVisibilityFileLFTags(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(AssignVisibilityFileLFTagsLambda).toHaveBeenCalledTimes(1);
    expect(AssignVisibilityFileLFTagsLambda).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a AssignVisibilityFileLFTagsChain construct', (done) => {
    const constructId = 'AssignVisibilityFileLFTagsChain';
    const construct = new AssignVisibilityFileLFTags(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupChain(failedChain, successChain);

    expect(AssignVisibilityFileLFTagsChain).toHaveBeenCalledTimes(1);
    expect(AssignVisibilityFileLFTagsChain).toHaveBeenCalledWith(construct, constructId, {
      assignVisibilityFileLFTagsLambda: lambdaMock, failedChain, successChain
    });
    expect(newChain).toEqual(getMockObject(AssignVisibilityFileLFTagsChain).mock.instances[0]);

    done();
  });
});
