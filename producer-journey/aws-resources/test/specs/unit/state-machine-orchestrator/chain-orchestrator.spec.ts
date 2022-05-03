import { Chain, Fail, Parallel, Pass, Succeed } from '@aws-cdk/aws-stepfunctions';
import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  ChainOrchestrator, ChainOrchestratorProps
} from '../../../../cdk/lib/state-machine-orchestrator/chain-orchestrator';

const basicStackId = 'StateMachineOrchestrator';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const getDataProductS3FileMock: any = {
  setupChain: jest.fn(() => ({ chain: 'getDataProductS3FileMockSetupChain' }))
};
const updateGlueCatalogPolicyMock: any = {
  setupChain: jest.fn(() => ({ chain: 'updateGlueCatalogPolicyMockSetupChain' }))
};
const updateS3BucketPolicyMock: any = {
  setupChain: jest.fn(() => ({ chain: 'updateS3BucketPolicyMockSetupChain' }))
};
const createGlueDatabasesMock: any = {
  setupIamChain: jest.fn(() => ({ chain: 'createGlueDatabasesMockSetupIamChain' })),
  setupLFChain: jest.fn(() => ({ chain: 'createGlueDatabasesMockSetupLFChain' }))
};
const createCrawlersMock: any = {
  setupS3IamChain: jest.fn(() => ({ chain: 'createCrawlersMockSetupS3IamChain' })),
  setupS3LFChain: jest.fn(() => ({ chain: 'createCrawlersMockSetupS3LFChain' }))
};
const registerS3LocationMock: any = {
  setupChain: jest.fn(() => ({ chain: 'registerS3LocationMockSetupChain' }))
};
const createDataProductLFTagMock: any = {
  setupChain: jest.fn(() => ({ chain: 'createDataProductLFTagMockSetupChain' }))
};
const assignDefaultLFTagsToDatabaseMock: any = {
  setupChain: jest.fn(() => ({ chain: 'assignDefaultLFTagsToDatabaseMockSetupChain' }))
};
const grantAccessToProducerMock: any = {
  setupChain: jest.fn(() => ({ chain: 'grantAccessToProducerMockSetupChain' }))
};
const executeCrawlersMock: any = {
  setupIamChain: jest.fn(() => ({ chain: 'executeCrawlersMockSetupIamChain' })),
  setupLFChain: jest.fn(() => ({ chain: 'executeCrawlersMockSetupLFChain' }))
};
const registerDataProductInDynamoMock: any = {
  setupChain: jest.fn(() => ({ chain: 'registerDataProductInDynamoMockSetupChain' }))
};
const sendOrchestratorEventMock: any = {
  setupChain: jest.fn(() => ({ chain: 'sendOrchestratorEventMockSetupChain' }))
};
const mockedStack: any = jest.fn();
const stackBaseProps: ChainOrchestratorProps = {
  deploymentEnvironment,
  getDataProductS3File: getDataProductS3FileMock,
  updateGlueCatalogPolicy: updateGlueCatalogPolicyMock,
  sendOrchestratorEvent: sendOrchestratorEventMock,
  updateS3BucketPolicy: updateS3BucketPolicyMock,
  createGlueDatabases: createGlueDatabasesMock,
  createCrawlers: createCrawlersMock,
  registerS3Location: registerS3LocationMock,
  createDataProductLFTag: createDataProductLFTagMock,
  assignDefaultLFTagsToDatabase: assignDefaultLFTagsToDatabaseMock,
  grantAccessToProducer: grantAccessToProducerMock,
  executeCrawlers: executeCrawlersMock,
  registerDataProductInDynamo: registerDataProductInDynamoMock,
  stackBaseName
};
const parallelNextMock = jest.fn();
const parallelAddCatchMock = jest.fn();
const parallelBranchMock = jest.fn();
const choiceWhenLFMock = jest.fn();
const choiceWhenDatabricksMock = jest.fn(() => ({ when: choiceWhenLFMock }));

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  Succeed: jest.fn(), Fail: jest.fn(), Chain: { start: jest.fn() }, Pass: jest.fn(),
  Choice: jest.fn(() => ({ when: choiceWhenDatabricksMock })), Condition: { stringEquals: jest.fn() },
  Parallel: jest.fn(() => ({
    next: parallelNextMock, addCatch: parallelAddCatchMock, branch: parallelBranchMock
  }))
}));

describe('# ChainOrchestrator', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledTimes(7);
    expect(Pass).toHaveBeenCalledTimes(2);
    expect(Parallel).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have main steps', (done) => {
    const stateMachineId = 'Producer Journey';
    const construct = new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Succeed).toHaveBeenCalledTimes(1);
    expect(Succeed).toHaveBeenCalledWith(construct, `${ stateMachineId }: Done`);
    expect(Fail).toHaveBeenCalledTimes(1);
    expect(Fail).toHaveBeenCalledWith(construct, `${ stateMachineId }: Job Failed`, {
      cause: 'Error', error: 'error'
    });
    expect(Chain.start).toHaveBeenNthCalledWith(1, getMockObject(Succeed).mock.instances[0]);
    expect(Chain.start).toHaveBeenNthCalledWith(2, getMockObject(Fail).mock.instances[0]);
    expect(Chain.start).toHaveBeenNthCalledWith(7, getMockObject(Chain.start).mock.results[6].value);

    done();
  });

  it('Should have a SetupAwsProducerIamChain Chain', (done) => {
    const construct = new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Pass).toHaveBeenNthCalledWith(1, construct, 'Aws Producer Iam Chain Finished');
    expect(Chain.start).toHaveBeenNthCalledWith(3, getMockObject(Pass).mock.instances[0]);
    expect(executeCrawlersMock.setupIamChain).toHaveBeenCalledTimes(1);
    expect(executeCrawlersMock.setupIamChain).toHaveBeenCalledWith(getMockObject(Chain.start).mock.results[2].value);
    expect(createCrawlersMock.setupS3IamChain).toHaveBeenCalledTimes(1);
    expect(createCrawlersMock.setupS3IamChain).toHaveBeenCalledWith('executeCrawlersMockSetupIamChain');
    expect(createGlueDatabasesMock.setupIamChain).toHaveBeenCalledTimes(1);
    expect(createGlueDatabasesMock.setupIamChain).toHaveBeenCalledWith('createCrawlersMockSetupS3IamChain');

    done();
  });

  it('Should have a setupAwsProducerLFChain Chain', (done) => {
    const construct = new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Pass).toHaveBeenNthCalledWith(2, construct, 'Aws Producer LF Chain Finished');
    expect(Chain.start).toHaveBeenNthCalledWith(4, getMockObject(Pass).mock.instances[1]);
    expect(grantAccessToProducerMock.setupChain).toHaveBeenCalledTimes(1);
    expect(grantAccessToProducerMock.setupChain).toHaveBeenCalledWith(getMockObject(Chain.start).mock.results[4].value);
    expect(assignDefaultLFTagsToDatabaseMock.setupChain).toHaveBeenCalledTimes(1);
    expect(assignDefaultLFTagsToDatabaseMock.setupChain).toHaveBeenCalledWith('grantAccessToProducerMockSetupChain');
    expect(executeCrawlersMock.setupLFChain).toHaveBeenCalledTimes(1);
    expect(executeCrawlersMock.setupLFChain).toHaveBeenCalledWith('assignDefaultLFTagsToDatabaseMockSetupChain');
    expect(createCrawlersMock.setupS3LFChain).toHaveBeenCalledTimes(1);
    expect(createCrawlersMock.setupS3LFChain).toHaveBeenCalledWith('executeCrawlersMockSetupLFChain');
    expect(createGlueDatabasesMock.setupLFChain).toHaveBeenCalledTimes(1);
    expect(createGlueDatabasesMock.setupLFChain).toHaveBeenCalledWith('createCrawlersMockSetupS3LFChain');

    done();
  });

  it('Should have a SetupParallelFlow Chain', (done) => {
    const construct = new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Parallel).toHaveBeenCalledTimes(1);
    expect(Parallel).toHaveBeenCalledWith(construct, 'Create both iam and lf databases for aws producer', {
      resultPath: '$.producerJourneyParallelOutput'
    });
    expect(parallelBranchMock).toHaveBeenCalledTimes(2);
    expect(parallelBranchMock).toHaveBeenNthCalledWith(1, 'createGlueDatabasesMockSetupIamChain');
    expect(parallelBranchMock).toHaveBeenNthCalledWith(2, 'createGlueDatabasesMockSetupLFChain');
    expect(parallelNextMock).toHaveBeenCalledTimes(1);
    expect(parallelNextMock).toHaveBeenCalledWith('registerDataProductInDynamoMockSetupChain');
    expect(parallelAddCatchMock).toHaveBeenCalledTimes(1);
    expect(parallelAddCatchMock).toHaveBeenCalledWith(getMockObject(Fail).mock.results[0].value);
    expect(Chain.start).toHaveBeenNthCalledWith(5, getMockObject(Parallel).mock.results[0].value);

    done();
  });

  it('Should have a SetupCommonBeforeChain Chain', (done) => {
    new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(createDataProductLFTagMock.setupChain).toHaveBeenCalledTimes(1);
    expect(createDataProductLFTagMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Fail).mock.results[0].value, getMockObject(Chain.start).mock.results[4].value
    );
    expect(registerS3LocationMock.setupChain).toHaveBeenCalledTimes(1);
    expect(registerS3LocationMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Fail).mock.results[0].value, 'createDataProductLFTagMockSetupChain'
    );
    expect(updateS3BucketPolicyMock.setupChain).toHaveBeenCalledTimes(1);
    expect(updateS3BucketPolicyMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Fail).mock.results[0].value, 'registerS3LocationMockSetupChain'
    );
    expect(updateGlueCatalogPolicyMock.setupChain).toHaveBeenCalledTimes(1);
    expect(updateGlueCatalogPolicyMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Fail).mock.results[0].value, 'updateS3BucketPolicyMockSetupChain'
    );
    expect(getDataProductS3FileMock.setupChain).toHaveBeenCalledTimes(1);
    expect(getDataProductS3FileMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Fail).mock.results[0].value, 'updateGlueCatalogPolicyMockSetupChain'
    );
    expect(Chain.start).toHaveBeenNthCalledWith(6, 'getDataProductS3FileMockSetupChain');

    done();
  });

  it('Should have a SetupCommonAfterChain Chain', (done) => {
    new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(sendOrchestratorEventMock.setupChain).toHaveBeenCalledTimes(1);
    expect(sendOrchestratorEventMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Fail).mock.results[0].value, getMockObject(Chain.start).mock.results[0].value
    );
    expect(registerDataProductInDynamoMock.setupChain).toHaveBeenCalledTimes(1);
    expect(registerDataProductInDynamoMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Fail).mock.results[0].value, 'sendOrchestratorEventMockSetupChain'
    );

    done();
  });
});
