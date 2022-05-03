import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { AwsCommon } from '@adidas-data-mesh/common-aws';
import { ProducerJourney } from '@adidas-data-mesh/producer-journey';
import { ConsumerJourney } from '@adidas-data-mesh/consumer-journey';
import { VisibilityJourney } from '@adidas-data-mesh/visibility-journey';
import { EventBus } from '@aws-cdk/aws-events';

export type StackBaseProps = StackProps & {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
  readonly dataProductCatalogueBucket: Bucket;
  readonly orchestratorEventBus: EventBus;
};

export class LakeFormationEnablementJourneys extends Stack {
  public readonly awsCommon: AwsCommon;
  public readonly producerJourney: ProducerJourney;
  public readonly consumerJourney: ConsumerJourney;
  public readonly visibilityJourney: VisibilityJourney;

  public constructor(scope: Construct, id: string, stackProps: StackBaseProps) {
    super(scope, id, stackProps);

    const { deploymentEnvironment, stackBaseName, dataProductCatalogueBucket, orchestratorEventBus } = stackProps;

    this.awsCommon = new AwsCommon(this, 'AwsCommon', {
      deploymentEnvironment,
      dataProductCatalogueBucket,
      orchestratorEventBus,
      stackBaseName
    });

    this.producerJourney = new ProducerJourney(this, 'ProducerJourney', {
      deploymentEnvironment,
      stackBaseName,
      awsCommon: this.awsCommon
    });

    this.consumerJourney = new ConsumerJourney(this, 'ConsumerJourney', {
      deploymentEnvironment,
      stackBaseName,
      awsCommon: this.awsCommon
    });

    this.visibilityJourney = new VisibilityJourney(this, 'VisibilityJourney', {
      deploymentEnvironment,
      stackBaseName,
      awsCommon: this.awsCommon
    });
  }
}
