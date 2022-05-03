import { Logger } from '@adidas-data-mesh/common';
import { AwsEventBridge } from './data/aws-event-bridge';

export type DomainConfig = {
  readonly awsEventBridge: AwsEventBridge;
  readonly logger: Logger;
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

export class Domain {
  private readonly awsEventBridge: AwsEventBridge;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';

  public constructor({ awsEventBridge, logger }: DomainConfig) {
    this.awsEventBridge = awsEventBridge;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(dataProductName: string, eventSource: EventSources, invokedFunctionArn: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', dataProductName, eventSource, invokedFunctionArn);

      await this.awsEventBridge.sendEventJourney({
        eventSource,
        detailType: DetailType.finish,
        dataProductName: this.fromSnakeCaseToKebabCase(dataProductName),
        resourcesArnEventReferences: [ invokedFunctionArn ]
      });

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  private fromSnakeCaseToKebabCase(snakeCaseString: string) {
    const snakeCaseRegex = /_/g;

    return snakeCaseString.replace(snakeCaseRegex, '-');
  }
}
