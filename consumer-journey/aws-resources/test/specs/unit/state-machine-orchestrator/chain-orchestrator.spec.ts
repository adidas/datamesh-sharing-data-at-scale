import { Chain, Choice, Condition, Fail, Pass, Succeed, Map, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  ChainOrchestrator, ChainOrchestratorProps, ConsumerType
} from '../../../../cdk/lib/state-machine-orchestrator/chain-orchestrator';

const basicStackId = 'ChainOrchestrator';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const mockedStack: any = jest.fn();
const getDataProductS3FilesMock: any = {
  setupChain: jest.fn(() => ({ chain: 'getDataProductS3FilesChainMock' }))
};
const grantAccessToConsumerMock: any = {
  setupChain: jest.fn(() => ({ chain: 'grantAccessToConsumerChainMock' }))
};
const updateGlueCatalogPolicyMock: any = {
  setupChain: jest.fn(() => ({ chain: 'updateGlueCatalogPolicyChainMock' }))
};
const updateS3BucketPolicyMock: any = {
  setupChain: jest.fn(() => ({ chain: 'updateS3BucketPolicyChainMock' }))
};
const createLinkedDatabaseMock: any = {
  setupChain: jest.fn(() => ({ chain: 'createLinkedDatabaseChainMock' }))
};
const grantAccessToConsumerRoleMock: any = {
  setupChain: jest.fn(() => ({ chain: 'grantAccessToConsumerRoleChainMock' }))
};
const stackBaseProps: ChainOrchestratorProps = {
  deploymentEnvironment,
  stackBaseName,
  getDataProductS3Files: getDataProductS3FilesMock,
  grantAccessToConsumer: grantAccessToConsumerMock,
  updateGlueCatalogPolicy: updateGlueCatalogPolicyMock,
  updateS3BucketPolicy: updateS3BucketPolicyMock,
  createLinkedDatabase: createLinkedDatabaseMock,
  grantAccessToConsumerRole: grantAccessToConsumerRoleMock
};

const secondWhenMock = jest.fn();
const firstWhenMock = jest.fn(() => ({ when: secondWhenMock }));
const addCatchMock = jest.fn();
const nextMock = jest.fn();
const mapIteratorMock = jest.fn(() => ({ next: nextMock }));

jest.mock('@aws-cdk/core', () => ({
  Construct: jest.fn()
}));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  Chain: { start: jest.fn() }, Succeed: jest.fn(), Fail: jest.fn(),
  Pass: jest.fn(), Choice: jest.fn(() => ({ when: firstWhenMock })), Condition: { stringEquals: jest.fn() },
  JsonPath: { stringAt: jest.fn() },
  Map: jest.fn(() => ({ iterator: mapIteratorMock, addCatch: addCatchMock }))
}));

describe('# StateMachineOrchestrator', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledTimes(8);
    expect(Pass).toHaveBeenCalledTimes(2);
    expect(Choice).toHaveBeenCalledTimes(1);
    expect(secondWhenMock).toHaveBeenCalledTimes(1);
    expect(firstWhenMock).toHaveBeenCalledTimes(1);
    expect(Condition.stringEquals).toHaveBeenCalledTimes(2);
    expect(Map).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should create main steps', (done) => {
    const constructId = 'Consumer Journey';
    const construct = new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Succeed).toHaveBeenCalledTimes(1);
    expect(Succeed).toHaveBeenCalledWith(construct, `${ constructId }: Done`);
    expect(Fail).toHaveBeenCalledTimes(1);
    expect(Fail).toHaveBeenCalledWith(
      construct, `${ constructId }: Job Failed`, { cause: 'Error', error: 'error' }
    );
    expect(Chain.start).toHaveBeenNthCalledWith(1, getMockObject(Succeed).mock.instances[0]);
    expect(Chain.start).toHaveBeenNthCalledWith(2, getMockObject(Fail).mock.instances[0]);
    expect(Chain.start).toHaveBeenNthCalledWith(8, getMockObject(Chain.start).mock.results[7].value);

    done();
  });

  it('Should have a setupCommonChain Chain', (done) => {
    new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenNthCalledWith(7, 'getDataProductS3FilesChainMock');
    expect(getDataProductS3FilesMock.setupChain).toHaveBeenCalledTimes(1);
    expect(getDataProductS3FilesMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Fail).mock.results[0].value,
      getMockObject(Succeed).mock.results[0].value
    );

    done();
  });

  it('Should have a setupAwsConsumerChain Chain', (done) => {
    const construct = new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Pass).toHaveBeenNthCalledWith(1, construct, 'Aws Consumer Chain Finished');
    expect(Chain.start).toHaveBeenNthCalledWith(3, getMockObject(Pass).mock.instances[0]);
    expect(grantAccessToConsumerRoleMock.setupChain).toHaveBeenCalledTimes(1);
    expect(grantAccessToConsumerRoleMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Chain.start).mock.results[2].value
    );
    expect(createLinkedDatabaseMock.setupChain).toHaveBeenCalledTimes(1);
    expect(createLinkedDatabaseMock.setupChain).toHaveBeenCalledWith(
      'grantAccessToConsumerRoleChainMock'
    );
    expect(grantAccessToConsumerMock.setupChain).toHaveBeenCalledTimes(1);
    expect(grantAccessToConsumerMock.setupChain).toHaveBeenCalledWith(
      'createLinkedDatabaseChainMock'
    );

    done();
  });

  it('Should have a setupIamConsumerChain Chain', (done) => {
    const construct = new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Pass).toHaveBeenNthCalledWith(2, construct, 'Iam Consumer Chain Finished');
    expect(Chain.start).toHaveBeenNthCalledWith(4, getMockObject(Pass).mock.instances[1]);
    expect(updateS3BucketPolicyMock.setupChain).toHaveBeenCalledTimes(1);
    expect(updateS3BucketPolicyMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Chain.start).mock.results[3].value
    );

    done();
  });

  it('Should have a setupMapChain Chain', (done) => {
    const construct = new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Map).toHaveBeenCalledWith(construct, 'Consumer Map', {
      itemsPath: getMockObject(JsonPath.stringAt).mock.results[0].value,
      parameters: {
        'currentConsumer.$': '$$.Map.Item.Value',
        'dataProductObject.$': '$.dataProductObject'
      },
      maxConcurrency: 1
    });
    expect(updateGlueCatalogPolicyMock.setupChain).toHaveBeenCalledTimes(1);
    expect(updateGlueCatalogPolicyMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Chain.start).mock.results[4].value
    );
    expect(mapIteratorMock).toHaveBeenCalledTimes(1);
    expect(mapIteratorMock).toHaveBeenCalledWith('updateGlueCatalogPolicyChainMock');
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(getMockObject(Succeed).mock.results[0].value);
    expect(addCatchMock).toHaveBeenCalledTimes(1);
    expect(addCatchMock).toHaveBeenCalledWith(getMockObject(Fail).mock.results[0].value);
    expect(Chain.start).toHaveBeenNthCalledWith(6, getMockObject(Map).mock.results[0].value);

    done();
  });

  it('Should have a setupTargetChoiceChain Chain', (done) => {
    const construct = new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Choice).toHaveBeenNthCalledWith(1, construct, 'Is Aws or external consumer');
    expect(Chain.start).toHaveBeenNthCalledWith(5, getMockObject(secondWhenMock).mock.results[0].value);
    expect(Condition.stringEquals).toHaveBeenNthCalledWith(1, '$.currentConsumer.type', ConsumerType.lakeformation);
    expect(Condition.stringEquals).toHaveBeenNthCalledWith(2, '$.currentConsumer.type', ConsumerType.iam);
    expect(firstWhenMock).toHaveBeenNthCalledWith(
      1,
      getMockObject(Condition.stringEquals).mock.results[0].value,
      'grantAccessToConsumerChainMock'
    );
    expect(secondWhenMock).toHaveBeenNthCalledWith(
      1,
      getMockObject(Condition.stringEquals).mock.results[1].value,
      'updateS3BucketPolicyChainMock'
    );

    done();
  });
});
