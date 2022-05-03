import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { UpdateGlueCatalogPolicyChain } from '../../../../cdk/lib/update-glue-catalog-policy/chain';
import {
  UpdateGlueCatalogPolicy, UpdateGlueCatalogPolicyProps
} from '../../../../cdk/lib/update-glue-catalog-policy/update-glue-catalog-policy';

const basicStackId = 'UpdateGlueCatalogPolicy';
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const sqsMock: any = jest.fn();
const stackBaseProps: UpdateGlueCatalogPolicyProps = {
  updateGlueCatalogPolicySqs: sqsMock
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/update-glue-catalog-policy/chain', () => ({
  UpdateGlueCatalogPolicyChain: jest.fn() }));

describe('# UpdateGlueCatalogPolicyChain', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new UpdateGlueCatalogPolicy(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a UpdateGlueCatalogPolicyChain construct', (done) => {
    const constructId = 'UpdateGlueCatalogPolicyChain';
    const construct = new UpdateGlueCatalogPolicy(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupChain(failedChain, successChain);

    expect(UpdateGlueCatalogPolicyChain).toHaveBeenCalledTimes(1);
    expect(UpdateGlueCatalogPolicyChain).toHaveBeenCalledWith(construct, constructId, {
      updateGlueCatalogPolicySqs: sqsMock, failedChain, successChain
    });
    expect(newChain).toEqual(getMockObject(UpdateGlueCatalogPolicyChain).mock.instances[0]);

    done();
  });
});
