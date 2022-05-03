import { Chain, Fail, Succeed } from '@aws-cdk/aws-stepfunctions';
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
const assignVisibilityFileLFTagsMock: any = {
  setupChain: jest.fn(() => ({ chain: 'assignVisibilityFileLFTagsMockSetupChain' }))
};
const updateDataProductInDynamoMock: any = {
  setupChain: jest.fn(() => ({ chain: 'updateDataProductInDynamoMockSetupChain' }))
};
const sendOrchestratorEventMock: any = {
  setupChain: jest.fn(() => ({ chain: 'sendOrchestratorEventMockSetupChain' }))
};
const mockedStack: any = jest.fn();
const stackBaseProps: ChainOrchestratorProps = {
  deploymentEnvironment,
  getDataProductS3File: getDataProductS3FileMock,
  sendOrchestratorEvent: sendOrchestratorEventMock,
  assignVisibilityFileLFTags: assignVisibilityFileLFTagsMock,
  updateDataProductInDynamo: updateDataProductInDynamoMock,
  stackBaseName
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  Succeed: jest.fn(), Fail: jest.fn(), Chain: { start: jest.fn() }
}));

describe('# ChainOrchestrator', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledTimes(4);

    done();
  });

  it('Should have main steps', (done) => {
    const stateMachineId = 'Visibility Journey';
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
    expect(Chain.start).toHaveBeenNthCalledWith(4, getMockObject(Chain.start).mock.results[2].value);

    done();
  });

  it('Should have a SetupCommonChain Chain', (done) => {
    new ChainOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(sendOrchestratorEventMock.setupChain).toHaveBeenCalledTimes(1);
    expect(sendOrchestratorEventMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Fail).mock.results[0].value, getMockObject(Succeed).mock.results[0].value
    );
    expect(updateDataProductInDynamoMock.setupChain).toHaveBeenCalledTimes(1);
    expect(updateDataProductInDynamoMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Fail).mock.results[0].value, 'sendOrchestratorEventMockSetupChain'
    );
    expect(assignVisibilityFileLFTagsMock.setupChain).toHaveBeenCalledTimes(1);
    expect(assignVisibilityFileLFTagsMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Fail).mock.results[0].value, 'updateDataProductInDynamoMockSetupChain'
    );
    expect(getDataProductS3FileMock.setupChain).toHaveBeenCalledTimes(1);
    expect(getDataProductS3FileMock.setupChain).toHaveBeenCalledWith(
      getMockObject(Fail).mock.results[0].value, 'assignVisibilityFileLFTagsMockSetupChain'
    );
    expect(Chain.start).toHaveBeenNthCalledWith(3, 'getDataProductS3FileMockSetupChain');

    done();
  });
});
