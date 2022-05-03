import { Construct } from '@aws-cdk/core';
import { UpdateGlueCatalogPolicyLambda } from '../../../../cdk/lib/update-glue-catalog-policy/lambda';
import { UpdateGlueCatalogPolicySqs } from '../../../../cdk/lib/update-glue-catalog-policy/sqs';
import {
  UpdateGlueCatalogPolicy, UpdateGlueCatalogPolicyProps
} from '../../../../cdk/lib/update-glue-catalog-policy/update-glue-catalog-policy';

const basicStackId = 'UpdateGlueCatalogPolicy';
const deploymentEnvironment = 'dev';
const stackBaseName = 'StackBaseName';
const lambdaMock: any = jest.fn();
const mockedStack: any = jest.fn();
const stackBaseProps: UpdateGlueCatalogPolicyProps = {
  deploymentEnvironment,
  stackBaseName
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/update-glue-catalog-policy/lambda', () => ({
  UpdateGlueCatalogPolicyLambda: jest.fn(() => ({ lambda: lambdaMock })) }));
jest.mock('../../../../cdk/lib/update-glue-catalog-policy/sqs', () => ({
  UpdateGlueCatalogPolicySqs: jest.fn() }));

describe('# UpdateGlueCatalogPolicy', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new UpdateGlueCatalogPolicy(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a UpdateGlueCatalogPolicyLambda construct', (done) => {
    const constructId = 'UpdateGlueCatalogPolicyLambda';
    const construct = new UpdateGlueCatalogPolicy(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(UpdateGlueCatalogPolicyLambda).toHaveBeenCalledTimes(1);
    expect(UpdateGlueCatalogPolicyLambda).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a UpdateGlueCatalogPolicySqs construct', (done) => {
    const constructId = 'UpdateGlueCatalogPolicySqs';
    const construct = new UpdateGlueCatalogPolicy(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(UpdateGlueCatalogPolicySqs).toHaveBeenCalledTimes(1);
    expect(UpdateGlueCatalogPolicySqs).toHaveBeenCalledWith(construct, constructId, {
      registerDataProductInConfluenceLambda: lambdaMock,
      deploymentEnvironment: stackBaseProps.deploymentEnvironment
    });

    done();
  });
});
