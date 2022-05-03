import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { SendOrchestratorEventChain } from '../../../../cdk/lib/send-orchestrator-event/chain';
import {
  SendOrchestratorEvent, SendOrchestratorEventProps
} from '../../../../cdk/lib/send-orchestrator-event/send-orchestrator-event';

const basicStackId = 'SendOrchestratorEvent';
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const lambdaMock: any = jest.fn();
const stackBaseProps: SendOrchestratorEventProps = {
  sendOrchestratorEventLambda: lambdaMock
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/send-orchestrator-event/chain', () => ({
  SendOrchestratorEventChain: jest.fn() }));

describe('# SendOrchestratorEvent', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new SendOrchestratorEvent(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a SendOrchestratorEventChain construct', (done) => {
    const constructId = 'SendOrchestratorEventChain';
    const construct = new SendOrchestratorEvent(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupChain(failedChain, successChain);

    expect(SendOrchestratorEventChain).toHaveBeenCalledTimes(1);
    expect(SendOrchestratorEventChain).toHaveBeenCalledWith(construct, constructId, {
      sendOrchestratorEventLambda: lambdaMock, failedChain, successChain
    });
    expect(newChain).toEqual(getMockObject(SendOrchestratorEventChain).mock.instances[0]);

    done();
  });
});
