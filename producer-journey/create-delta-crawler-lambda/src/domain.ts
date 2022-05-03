import { Logger } from '@adidas-data-mesh/common';
import { AwsGlue } from './data/aws-glue';

type DomainConfig = {
  readonly lakeRoleSessionName: string;
  readonly accountId: string;
  readonly awsGlue: AwsGlue;
  readonly logger: Logger;
};

export class Domain {
  private readonly lakeRoleSessionName: string;
  private readonly accountId: string;
  private readonly awsGlue: AwsGlue;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';

  public constructor({ awsGlue, lakeRoleSessionName, accountId, logger }: DomainConfig) {
    this.lakeRoleSessionName = lakeRoleSessionName;
    this.accountId = accountId;
    this.awsGlue = awsGlue;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(glueDatabaseName: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', glueDatabaseName);

      const crawlerRoleArn = `arn:aws:iam::${ this.accountId }:role/${ this.lakeRoleSessionName }`;
      const deltaTables = [
        's3://mesh-lab-product-b/orders_local_delta_db/',
        's3://mesh-lab-product-b/orders_local/',
        's3://mesh-lab-product-b/orders/'
      ];

      await this.awsGlue.createDeltaCrawler(glueDatabaseName, deltaTables, crawlerRoleArn);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
