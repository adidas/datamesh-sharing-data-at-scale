import { Construct } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { EvaluateExpression, LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { IFunction } from '@aws-cdk/aws-lambda';

export type SendOrchestratorEventChainProps = {
  readonly sendOrchestratorEventLambda: IFunction;
  readonly failedChain: Chain;
  readonly successChain: Chain;
};

export enum EventSources {
  producer = 'journeys.producer',
  consumer = 'journeys.consumer',
  visibility = 'journeys.visibility'
}

export class SendOrchestratorEventChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: SendOrchestratorEventChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: SendOrchestratorEventChainProps) {
    return Chain
      .start(this.setJourneySource())
      .next(this.createSendOrchestratorEventChain(props))
      .next(props.successChain);
  }

  private createSendOrchestratorEventChain(props: SendOrchestratorEventChainProps): IChainable {
    const { sendOrchestratorEventLambda, failedChain } = props;

    return new LambdaInvoke(this, 'Send Orchestrator Event', {
      inputPath: '$',
      resultPath: JsonPath.DISCARD,
      lambdaFunction: sendOrchestratorEventLambda,
      payloadResponseOnly: true
    })
      .addRetry({ maxAttempts: 1 })
      .addCatch(failedChain, { resultPath: '$.error' });
  }

  private setJourneySource(): IChainable {
    return new EvaluateExpression(this, 'Set Journey Source', {
      expression: `\`${ EventSources.producer }\``,
      resultPath: '$.journeySource'
    });
  }
}
