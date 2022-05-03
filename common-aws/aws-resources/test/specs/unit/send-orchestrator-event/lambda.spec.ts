import { Construct, Duration } from '@aws-cdk/core';
import { Code, Function } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import {
  SendOrchestratorEvent, SendOrchestratorEventProps
} from '../../../../cdk/lib/send-orchestrator-event/lambda';

const timeoutSeconds = 10;
const memorySizeMB = 128;
const maxNameLength = 64;
const basicStackId = 'SendOrchestratorEvent';
const lambdaId = basicStackId;
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const orchestratorEventBus: any = { eventBusArn: 'eventBusArn' };
const mockedStack: any = jest.fn();
const addToRolePolicyMock = jest.fn();
const stackBaseProps: SendOrchestratorEventProps = {
  deploymentEnvironment,
  stackBaseName,
  orchestratorEventBus
};

jest.mock('@aws-cdk/core', () => ({
  Construct: jest.fn(), Duration: { seconds: jest.fn().mockReturnValue('mock') }
}));
jest.mock('@aws-cdk/aws-lambda', () => ({
  Function: jest.fn(() => ({ addToRolePolicy: addToRolePolicyMock })),
  Code: { fromAsset: jest.fn().mockReturnValue('mock') },
  Runtime: { NODEJS_14_X: 'NODEJS_14_X' }
}));
jest.mock('@aws-cdk/aws-iam', () => ({ PolicyStatement: jest.fn() }));

describe('# SendOrchestratorEvent Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new lambda successfully', (done) => {
    const construct = new SendOrchestratorEvent(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledTimes(1);
    expect(Function).toHaveBeenCalledWith(construct, lambdaId, {
      runtime: 'NODEJS_14_X',
      code: 'mock',
      handler: 'index.sendOrchestratorEventHandler',
      description: 'Sends events from the sfn journeys to orchestrate them',
      timeout: 'mock',
      environment: {
        LOGGER_LEVEL: 'info',
        EVENT_BUS: 'eventBusArn'
      },
      functionName: `${ stackBaseName }-${ lambdaId }-${ deploymentEnvironment }`
        .substring(0, maxNameLength),
      memorySize: memorySizeMB,
      logRetention: 7
    });
    expect(Code.fromAsset).toHaveBeenCalledTimes(1);
    expect(Code.fromAsset).toHaveBeenCalledWith(
      './common-aws/send-orchestrator-event-lambda/dist'
    );
    expect(Duration.seconds).toHaveBeenCalledTimes(1);
    expect(Duration.seconds).toHaveBeenCalledWith(timeoutSeconds);

    done();
  });

  it('Should create the proper iam actions to the lambda successfully', (done) => {
    new SendOrchestratorEvent(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(addToRolePolicyMock).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledWith({
      actions: [ 'events:PutEvents' ],
      resources: [ 'eventBusArn' ]
    });

    done();
  });
});
