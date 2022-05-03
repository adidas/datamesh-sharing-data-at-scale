import { S3 } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';

export class AwsS3 {
  private readonly dataProductCatalogueBucket: string;
  private readonly s3: S3;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsS3';

  public constructor(dataProductCatalogueBucket: string, s3: S3, logger: Logger) {
    this.dataProductCatalogueBucket = dataProductCatalogueBucket;
    this.s3 = s3;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async getS3Object<T>(s3ObjectKey: string): Promise<T> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', s3ObjectKey);

      const s3Object = await this.s3.getObject({
        Bucket: this.dataProductCatalogueBucket,
        Key: s3ObjectKey
      }).promise();

      if (!s3Object?.Body) {
        throw new Error(`No data product visibility s3 object file has been found for ${
          s3ObjectKey }`);
      }

      this.logger.debug(`${ s3ObjectKey } s3 object found: `, s3Object);

      const result = JSON.parse((s3Object.Body as Buffer).toString()) as T;

      this.logger.info('Finishing...', result);

      return result;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
