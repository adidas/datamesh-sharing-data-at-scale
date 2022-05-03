import { StateMachine } from '@aws-cdk/aws-stepfunctions';
import { Construct, Duration } from '@aws-cdk/core';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import {
  StateMachineOrchestrator, StateMachineOrchestratorProps
} from '../../../../cdk/lib/state-machine-orchestrator/state-machine';
import { ChainOrchestrator } from '../../../../cdk/lib/state-machine-orchestrator/chain-orchestrator';
import stepFunctionConfig from '../../../../cdk/lib/state-machine-orchestrator/config/state.machine.config.json';

const basicStackId = 'StateMachineOrchestrator';
const deploymentEnvironment = 'dev';
const lakeFormationAdminRoleName = 'data-lake-administrator-dev';
const stackBaseName = 'stackBaseName';
const getDataProductS3FilesMock: any = {};
const grantAccessToConsumerMock: any = {};
const updateGlueCatalogPolicyMock: any = {};
const updateS3BucketPolicyMock: any = {};
const grantAccessToConsumerRoleMock: any = {};
const createLinkedDatabaseMock: any = {};
const mockedStack: any = jest.fn();
const stackBaseProps: StateMachineOrchestratorProps = {
  deploymentEnvironment,
  getDataProductS3Files: getDataProductS3FilesMock,
  updateGlueCatalogPolicy: updateGlueCatalogPolicyMock,
  updateS3BucketPolicy: updateS3BucketPolicyMock,
  grantAccessToConsumer: grantAccessToConsumerMock,
  createLinkedDatabase: createLinkedDatabaseMock,
  grantAccessToConsumerRole: grantAccessToConsumerRoleMock,
  stackBaseName
};
const chainOrchestratorChainMock = jest.fn();
const addToRolePolicyMock = jest.fn();

jest.mock('@aws-cdk/core', () => ({
  ...jest.requireActual('@aws-cdk/core'),
  Construct: jest.fn(), Stack: { of: jest.fn(() => ({ account: 'accountId' })) }
}));
jest.mock('@aws-cdk/aws-iam', () => ({ PolicyStatement: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  StateMachine: jest.fn(() => ({ addToRolePolicy: addToRolePolicyMock })) }));
jest.mock('../../../../cdk/lib/state-machine-orchestrator/chain-orchestrator', () => ({
  ChainOrchestrator: jest.fn(() => ({ chain: chainOrchestratorChainMock }))
}));

describe('# StateMachineOrchestrator', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new StateMachineOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a ChainOrchestrator construct', (done) => {
    const constructId = 'ChainOrchestrator';
    const construct = new StateMachineOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(ChainOrchestrator).toHaveBeenCalledTimes(1);
    expect(ChainOrchestrator).toHaveBeenCalledWith(construct, constructId, stackBaseProps);

    done();
  });

  it('Should have a StateMachine construct', (done) => {
    const constructId = 'ConsumerJourney';
    const construct = new StateMachineOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(StateMachine).toHaveBeenCalledTimes(1);
    expect(StateMachine).toHaveBeenCalledWith(construct, constructId, {
      stateMachineName: `${ stackBaseName }-consumer-dev`,
      definition: chainOrchestratorChainMock,
      timeout: Duration.minutes(stepFunctionConfig.StateMachine.TimeoutMinutes)
    });

    done();
  });

  it('Should create the proper iam actions to the state machine successfully', (done) => {
    new StateMachineOrchestrator(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(addToRolePolicyMock).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledWith({
      actions: [ 'iam:PassRole', 'sts:AssumeRole', 'iam:GetRole' ],
      resources: [ `arn:aws:iam::accountId:role/${ lakeFormationAdminRoleName }` ]
    });

    done();
  });
});
