import { Construct, Stack } from '@aws-cdk/core';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { Rule, EventBus, RuleTargetInput, EventField } from '@aws-cdk/aws-events';
import { SfnStateMachine } from '@aws-cdk/aws-events-targets';
import { StateMachine } from '@aws-cdk/aws-stepfunctions';
import defaultConfig from './config/event-bridge.config.default.json';

export type DataProductCatalogueEventProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
};

export type EventRulesConfig = {
  readonly StepFunctionsJourneysName: {
    readonly ConsumerJourney: string;
    readonly VisibilityJourney: string;
    readonly ProducerJourney: string;
  };
};

export enum EventSources {
  producer = 'journeys.producer',
  consumer = 'journeys.consumer',
  visibility = 'journeys.visibility'
}

export enum DetailType {
  create = 'CREATE',
  update = 'UPDATE',
  finish = 'FINISH'
}

export type SfnEventInput = {
  readonly dataProductName: string;
  readonly correlationId: string;
};

export class DataProductCatalogueEvent extends Construct {
  /* AWS resources attached to this construct */
  public readonly eventBus: EventBus;
  public readonly producerEvents: Array<Rule>;
  public readonly visibilityEvents: Array<Rule>;
  public readonly consumerEvents: Array<Rule>;

  public constructor(scope: Construct, id: string, props: DataProductCatalogueEventProps) {
    super(scope, id);

    const config = this.loadConfig(props.deploymentEnvironment);

    this.eventBus = this.setupEventBus(this, props);
    this.producerEvents = this.setupProducerEvent(this, props, config);
    this.visibilityEvents = this.setupVisibilityEvent(this, props, config);
    this.consumerEvents = this.setupConsumerEvent(this, props, config);
  }

  private setupEventBus(scope: Construct, { deploymentEnvironment }: DataProductCatalogueEventProps) {
    const eventBus = new EventBus(scope, 'DataProductCatalogueEventBus', {
      eventBusName: `adidas-data-product-catalog-journeys-orchestrator-${ deploymentEnvironment }`
    });

    return eventBus;
  }

  private setupProducerEvent(scope: Construct, props: DataProductCatalogueEventProps, config: EventRulesConfig) {
    const targetRule = this.getSfnTarget('ProducerStateMachine', config.StepFunctionsJourneysName.ProducerJourney);

    const ruleFromFile = new Rule(scope, 'ProducerJourneyEventFromFile', {
      description: 'Orchestrates producer journey step function from the s3 files',
      ruleName: `producer-journey-from-file-${ props.deploymentEnvironment }`,
      eventPattern: {
        source: [ EventSources.producer ],
        detailType: [ DetailType.create ]
      },
      targets: [ targetRule ],
      eventBus: this.eventBus
    });

    return [ ruleFromFile ];
  }

  private setupVisibilityEvent(scope: Construct, props: DataProductCatalogueEventProps, config: EventRulesConfig) {
    const targetRule = this.getSfnTarget('VisibilityStateMachine', config.StepFunctionsJourneysName.VisibilityJourney);

    const ruleFromSfn = new Rule(scope, 'VisibilityJourneyEventFromSfn', {
      description: 'Orchestrates visibility journey step function from others SFN dependencies',
      ruleName: `visibility-journey-from-sfn-${ props.deploymentEnvironment }`,
      eventPattern: {
        source: [ EventSources.producer ],
        detailType: [ DetailType.finish ]
      },
      targets: [ targetRule ],
      eventBus: this.eventBus
    });

    return [ ruleFromSfn ];
  }

  private setupConsumerEvent(scope: Construct, props: DataProductCatalogueEventProps, config: EventRulesConfig) {
    const targetRule = this.getSfnTarget('ConsumerStateMachine', config.StepFunctionsJourneysName.ConsumerJourney);

    const ruleFromSfn = new Rule(scope, 'ConsumerJourneyEventFromSfn', {
      description: 'Orchestrates consumer journey step function from others SFN dependencies',
      ruleName: `consumer-journey-from-sfn-${ props.deploymentEnvironment }`,
      eventPattern: {
        source: [ EventSources.visibility ],
        detailType: [ DetailType.finish ]
      },
      targets: [ targetRule ],
      eventBus: this.eventBus
    });

    return [ ruleFromSfn ];
  }

  private getSfnTarget(id: string, sfnName: string) {
    const { account, region } = Stack.of(this);
    const sfnArn = `arn:aws:states:${ region }:${ account }:stateMachine:${ sfnName }`;
    const stateMachine = StateMachine.fromStateMachineArn(
      this, id, sfnArn
    );

    return new SfnStateMachine(stateMachine, {
      input: RuleTargetInput.fromObject({
        dataProductName: EventField.fromPath('$.detail.dataProductName'),
        correlationId: EventField.fromPath('$.id')
      } as SfnEventInput)
    });
  }

  private loadConfig(deploymentEnvironment: DeploymentEnvironment): EventRulesConfig {
    const { StepFunctionsJourneysName: sfnJourneysNames } = defaultConfig;

    return {
      StepFunctionsJourneysName: {
        ConsumerJourney: `${ sfnJourneysNames.ConsumerJourney }-${ deploymentEnvironment }`,
        ProducerJourney: `${ sfnJourneysNames.ProducerJourney }-${ deploymentEnvironment }`,
        VisibilityJourney: `${ sfnJourneysNames.VisibilityJourney }-${ deploymentEnvironment }`
      }
    };
  }
}
