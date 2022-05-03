import { Construct } from '@aws-cdk/core';
import { Chain, Choice, Condition, Fail, Pass, Succeed, Map, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { StateMachineOrchestratorProps } from './state-machine';

export enum ConsumerType {
  iam = 'iam',
  lakeformation = 'lakeformation'
}

export type ChainOrchestratorProps = StateMachineOrchestratorProps;

export class ChainOrchestrator extends Construct {
  /* AWS resources attached to this stack */
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: ChainOrchestratorProps) {
    super(scope, id);

    this.chain = this.setupStateMachineChain(props);
  }

  private setupStateMachineChain(props: ChainOrchestratorProps): Chain {
    const stateMachineId = 'Consumer Journey';

    const successChain = Chain.start(new Succeed(this, `${ stateMachineId }: Done`));
    const failedChain = Chain.start(new Fail(this, `${ stateMachineId }: Job Failed`, {
      cause: 'Error', error: 'error'
    }));

    const awsConsumerChain = this.setupAwsConsumerChain(props);
    const iamConsumerChain = this.setupIamConsumerChain(props);
    const mapChain = this.setupMapChain(
      props,
      this.setupTargetChoiceChain(awsConsumerChain, iamConsumerChain),
      successChain,
      failedChain
    );
    const mainChain = Chain.start(this.setupCommonChain(props, mapChain, failedChain));

    return mainChain;
  }

  private setupCommonChain(props: ChainOrchestratorProps, successChain: Chain, failedChain: Chain) {
    const { getDataProductS3Files } = props;
    const getDataProductS3FilesChain = getDataProductS3Files.setupChain(failedChain, successChain);

    return Chain.start(getDataProductS3FilesChain.chain);
  }

  private setupAwsConsumerChain(props: ChainOrchestratorProps): Chain {
    const { grantAccessToConsumer, grantAccessToConsumerRole, createLinkedDatabase } = props;
    const mapFlowHasFinished = Chain.start(new Pass(this, 'Aws Consumer Chain Finished'));
    const grantAccessToConsumerRoleChain = grantAccessToConsumerRole.setupChain(
      mapFlowHasFinished
    );
    const createLinkedDatabaseChain = createLinkedDatabase.setupChain(grantAccessToConsumerRoleChain.chain);
    const grantAccessToConsumerChain = grantAccessToConsumer.setupChain(createLinkedDatabaseChain.chain);

    return grantAccessToConsumerChain.chain;
  }

  private setupIamConsumerChain(props: ChainOrchestratorProps): Chain {
    const { updateS3BucketPolicy } = props;
    const mapFlowHasFinished = Chain.start(new Pass(this, 'Iam Consumer Chain Finished'));
    const updateS3BucketPolicyChain = updateS3BucketPolicy.setupChain(
      mapFlowHasFinished
    );

    return updateS3BucketPolicyChain.chain;
  }

  private setupMapChain(
      props: ChainOrchestratorProps,
      choiceChain: Chain,
      successChain: Chain,
      failedChain: Chain
  ): Chain {
    const { updateGlueCatalogPolicy } = props;
    const mapChain = new Map(this, 'Consumer Map', {
      itemsPath: JsonPath.stringAt('$.dataProductConsumersObject.consumers'),
      parameters: {
        'currentConsumer.$': '$$.Map.Item.Value',
        'dataProductObject.$': '$.dataProductObject'
      },
      maxConcurrency: 1
    });
    const updateGlueCatalogPolicyChain = updateGlueCatalogPolicy.setupChain(choiceChain);

    mapChain.iterator(updateGlueCatalogPolicyChain.chain)
      .next(successChain);
    mapChain.addCatch(failedChain);

    return Chain.start(mapChain);
  }

  private setupTargetChoiceChain(
      awsChoiceChain: Chain, iamChoiceChain: Chain
  ) {
    const targetChoice = new Choice(this, 'Is Aws or external consumer');

    return Chain.start(
      targetChoice
        .when(
          Condition.stringEquals('$.currentConsumer.type', ConsumerType.lakeformation),
          awsChoiceChain
        )
        .when(
          Condition.stringEquals('$.currentConsumer.type', ConsumerType.iam),
          iamChoiceChain
        )
    );
  }
}
