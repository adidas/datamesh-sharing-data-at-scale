import { Logger } from '@adidas-data-mesh/common';
import { Domain } from './domain';

export type DataProductProducerInfoObject = {
  readonly 'producer-role-arn': string;
  readonly 'bucket-name': string;
};

export class Handler {
  private readonly domain: Domain;
  private readonly logger: Logger;
  private readonly loggingTag = 'Handler';

  public constructor(domain: Domain, logger: Logger) {
    this.domain = domain;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(input: DataProductProducerInfoObject): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', input);

      const { 'producer-role-arn': producerRoleArn, 'bucket-name': bucketName } = input;

      await this.domain.execute(bucketName, producerRoleArn);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
