import { Construct } from '@aws-cdk/core';
import { Chain, Fail, Succeed } from '@aws-cdk/aws-stepfunctions';
import { StateMachineOrchestratorProps } from './state-machine';

export type ChainOrchestratorProps = StateMachineOrchestratorProps;

export class ChainOrchestrator extends Construct {
  /* AWS resources attached to this stack */
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: ChainOrchestratorProps) {
    super(scope, id);

    this.chain = this.setupStateMachineChain(props);
  }

  private setupStateMachineChain(props: ChainOrchestratorProps): Chain {
    const stateMachineId = 'Visibility Journey';

    const successChain = Chain.start(new Succeed(this, `${ stateMachineId }: Done`));
    const failedChain = Chain.start(new Fail(this, `${ stateMachineId }: Job Failed`, {
      cause: 'Error', error: 'error'
    }));

    const mainChain = Chain.start(this.setupCommonChain(props, successChain, failedChain));

    return mainChain;
  }

  private setupCommonChain(props: ChainOrchestratorProps, successChain: Chain, failedChain: Chain) {
    const {
      getDataProductS3File, assignVisibilityFileLFTags, updateDataProductInDynamo, sendOrchestratorEvent
    } = props;
    const sendOrchestratorEventChain = sendOrchestratorEvent.setupChain(failedChain, successChain);
    const updateDataProductInDynamoChain = updateDataProductInDynamo.setupChain(
      failedChain, sendOrchestratorEventChain.chain
    );
    const assignVisibilityFileLFTagsChain = assignVisibilityFileLFTags.setupChain(
      failedChain, updateDataProductInDynamoChain.chain
    );
    const getDataProductS3FileChain = getDataProductS3File.setupChain(
      failedChain, assignVisibilityFileLFTagsChain.chain
    );

    return Chain.start(getDataProductS3FileChain.chain);
  }
}
