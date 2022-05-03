import { Construct } from '@aws-cdk/core';
import { IFunction } from '@aws-cdk/aws-lambda';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { SendOrchestratorEventChain } from './chain';

export type SendOrchestratorEventProps = {
  readonly sendOrchestratorEventLambda: IFunction;
};

export class SendOrchestratorEvent extends Construct {
  /* AWS resources attached to this construct */
  public readonly sendOrchestratorEventLambda: IFunction;

  public constructor(scope: Construct, id: string, { sendOrchestratorEventLambda }: SendOrchestratorEventProps) {
    super(scope, id);

    this.sendOrchestratorEventLambda = sendOrchestratorEventLambda;
  }

  public setupChain(failedChain: Chain, successChain: Chain): SendOrchestratorEventChain {
    const newChain = new SendOrchestratorEventChain(this, 'SendOrchestratorEventChain', {
      sendOrchestratorEventLambda: this.sendOrchestratorEventLambda,
      failedChain,
      successChain
    });

    return newChain;
  }
}
