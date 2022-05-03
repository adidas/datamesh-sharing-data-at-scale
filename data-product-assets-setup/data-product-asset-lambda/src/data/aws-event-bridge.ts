import { EventBridge } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';

export type AwsEventBridgeProps = {
  readonly eventSource: EventSources;
  readonly resourcesArnEventReferences: Array<string>;
  readonly detailType: DetailType;
  readonly dataProductName: string;
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
};

export class AwsEventBridge {
  private readonly eventBridge: EventBridge;
  private readonly eventBusArn: string;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsEventBridge';

  public constructor(eventBridge: EventBridge, eventBusArn: string, logger: Logger) {
    this.eventBridge = eventBridge;
    this.eventBusArn = eventBusArn;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async sendEventJourney({
    eventSource, detailType, resourcesArnEventReferences, dataProductName
  }: AwsEventBridgeProps): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', eventSource, detailType, resourcesArnEventReferences, dataProductName);

      const eventBridgeObject = await this.eventBridge.putEvents({
        Entries: [
          {
            Detail: JSON.stringify({
              dataProductName
            } as SfnEventInput),
            DetailType: detailType,
            EventBusName: this.eventBusArn,
            Resources: resourcesArnEventReferences,
            Source: eventSource
          }
        ]
      }).promise();

      this.logger.info('Finishing...', eventBridgeObject);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
