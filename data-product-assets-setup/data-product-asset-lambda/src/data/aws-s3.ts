import { S3 } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';
import { DataProductAsset } from '../data-product-assets.model';

export class AwsS3 {
  private readonly s3: S3;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsS3';

  public constructor(s3: S3, logger: Logger) {
    this.s3 = s3;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async uploadDataProductAsset(
      bucketName: string,
      bucketKey: string,
      dataProductAsset: DataProductAsset
  ): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', bucketName, bucketKey, dataProductAsset);

      const s3Object = await this.s3.putObject({
        Body: JSON.stringify(dataProductAsset),
        Bucket: bucketName,
        Key: bucketKey
      }).promise();

      this.logger.info(`New ${ bucketName }${ bucketKey } object created: `, s3Object);

      this.logger.info('Finishing...');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async deleteDataProductAsset(
      bucketName: string,
      bucketKey: string
  ): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', bucketName, bucketKey);

      const s3Object = await this.s3.deleteObject({
        Bucket: bucketName,
        Key: bucketKey
      }).promise();

      this.logger.info(`New ${ bucketName }${ bucketKey } object created: `, s3Object);

      this.logger.info('Finishing...');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
