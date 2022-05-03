import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { UpdateGlueCatalogPolicyChain } from '../../../../cdk/lib/update-glue-catalog-policy/chain';
import { UpdateGlueCatalogPolicy } from '../../../../cdk/lib/update-glue-catalog-policy/update-glue-catalog-policy';

const basicStackId = 'ConsumerJourney';
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const updateGlueCatalogPolicySqs: any = 'UpdateGlueCatalogPolicyLambda';

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/update-glue-catalog-policy/chain', () => ({
  UpdateGlueCatalogPolicyChain: jest.fn()
}));

describe('# UpdateGlueCatalogPolicy', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new UpdateGlueCatalogPolicy(mockedStack, basicStackId, { updateGlueCatalogPolicySqs });

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a UpdateGlueCatalogPolicyChain construct', (done) => {
    const constructId = 'UpdateGlueCatalogPolicyChain';
    const construct = new UpdateGlueCatalogPolicy(mockedStack, basicStackId, { updateGlueCatalogPolicySqs });

    const newChain = construct.setupChain(successChain);

    expect(UpdateGlueCatalogPolicyChain).toHaveBeenCalledTimes(1);
    expect(UpdateGlueCatalogPolicyChain).toHaveBeenCalledWith(construct, constructId, {
      successChain, updateGlueCatalogPolicySqs
    });
    expect(newChain).toEqual(getMockObject(UpdateGlueCatalogPolicyChain).mock.instances[0]);

    done();
  });
});
