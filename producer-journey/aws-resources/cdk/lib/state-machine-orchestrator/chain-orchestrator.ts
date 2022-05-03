import { Construct } from '@aws-cdk/core';
import { Chain, Fail, Parallel, Pass, Succeed } from '@aws-cdk/aws-stepfunctions';
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
    const stateMachineId = 'Producer Journey';

    const successChain = Chain.start(new Succeed(this, `${ stateMachineId }: Done`));
    const failedChain = Chain.start(new Fail(this, `${ stateMachineId }: Job Failed`, {
      cause: 'Error', error: 'error'
    }));

    const commonAfterParallelChain = this.setupCommonAfterParallelChain(props, successChain, failedChain);
    const parallelBranches = [
      this.setupAwsProducerIamChain(props),
      this.setupAwsProducerLFChain(props)
    ];
    const parallelFlow = this.setupParallelFlow(parallelBranches, commonAfterParallelChain, failedChain);
    const mainChain = Chain.start(this.setupCommonBeforeParallelChain(props, parallelFlow, failedChain));

    return mainChain;
  }

  private setupCommonBeforeParallelChain(props: ChainOrchestratorProps, successChain: Chain, failedChain: Chain) {
    const {
      getDataProductS3File, registerS3Location, createDataProductLFTag, updateGlueCatalogPolicy, updateS3BucketPolicy
    } = props;
    const createDataProductLFTagChain = createDataProductLFTag.setupChain(failedChain, successChain);
    const registerS3LocationChain = registerS3Location.setupChain(failedChain, createDataProductLFTagChain.chain);
    const updateS3BucketPolicyChain = updateS3BucketPolicy.setupChain(failedChain, registerS3LocationChain.chain);
    const updateGlueCatalogPolicyChain = updateGlueCatalogPolicy.setupChain(
      failedChain, updateS3BucketPolicyChain.chain
    );
    const getDataProductS3FileChain = getDataProductS3File.setupChain(failedChain, updateGlueCatalogPolicyChain.chain);

    return Chain.start(getDataProductS3FileChain.chain);
  }

  private setupParallelFlow(branches: Array<Chain>, successChain: Chain, failedChain: Chain) {
    const parallelFlow = new Parallel(this, 'Create both iam and lf databases for aws producer', {
      resultPath: '$.producerJourneyParallelOutput'
    });

    branches.map((branch) => parallelFlow.branch(branch));

    parallelFlow.next(successChain);
    parallelFlow.addCatch(failedChain);

    return Chain.start(parallelFlow);
  }

  private setupAwsProducerIamChain({
    createGlueDatabases, createCrawlers, executeCrawlers
  }: ChainOrchestratorProps): Chain {
    const parallelFlowHasFinished = Chain.start(new Pass(this, 'Aws Producer Iam Chain Finished'));
    const executeCrawlersChain = executeCrawlers.setupIamChain(parallelFlowHasFinished);
    const createS3CrawlersChain = createCrawlers.setupS3IamChain(executeCrawlersChain.chain);
    const createDatabaseChain = createGlueDatabases.setupIamChain(createS3CrawlersChain.chain);

    return createDatabaseChain.chain;
  }

  private setupAwsProducerLFChain({
    createGlueDatabases, createCrawlers, executeCrawlers,
    assignDefaultLFTagsToDatabase, grantAccessToProducer
  }: ChainOrchestratorProps): Chain {
    const parallelFlowHasFinished = Chain.start(new Pass(this, 'Aws Producer LF Chain Finished'));
    const grantAccessToProducerChain = grantAccessToProducer.setupChain(parallelFlowHasFinished);
    const assignDefaultLFTagsToDatabaseChain = assignDefaultLFTagsToDatabase.setupChain(
      grantAccessToProducerChain.chain
    );
    const executeCrawlersChain = executeCrawlers.setupLFChain(assignDefaultLFTagsToDatabaseChain.chain);
    const createS3CrawlersChain = createCrawlers.setupS3LFChain(executeCrawlersChain.chain);
    const createDatabaseChain = createGlueDatabases.setupLFChain(createS3CrawlersChain.chain);

    return createDatabaseChain.chain;
  }

  private setupCommonAfterParallelChain(props: ChainOrchestratorProps, successChain: Chain, failedChain: Chain) {
    const {
      registerDataProductInDynamo, sendOrchestratorEvent
    } = props;
    const sendOrchestratorEventChain = sendOrchestratorEvent.setupChain(failedChain, successChain);
    const registerDataProductInDynamoChain = registerDataProductInDynamo.setupChain(
      failedChain, sendOrchestratorEventChain.chain
    );

    return registerDataProductInDynamoChain.chain;
  }
}
