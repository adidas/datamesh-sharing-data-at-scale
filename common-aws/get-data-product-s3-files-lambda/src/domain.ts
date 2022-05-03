import { Logger } from '@adidas-data-mesh/common';
import {
  DataProductObject, DataProductVisibilityObject, DataProductConsumersObject, DataProductProducerInfoObject,
  DataProductOutputsObject, DataProductInputsObject, AssetName
} from './data-product-assets.model';
import { AwsS3 } from './data/aws-s3';

type DomainConfig = {
  readonly awsS3: AwsS3;
  readonly logger: Logger;
};

export type DomainOutput = {
  readonly dataProductObject: DataProductObject;
  readonly dataProductProducerInfoObject: DataProductProducerInfoObject;
  readonly dataProductInputsObject: DataProductInputsObject;
  readonly dataProductOutputsObject: DataProductOutputsObject;
  readonly dataProductVisibilityObject: DataProductVisibilityObject;
  readonly dataProductConsumersObject: DataProductConsumersObject;
};

export class Domain {
  private readonly awsS3: AwsS3;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';

  public constructor({ awsS3, logger }: DomainConfig) {
    this.awsS3 = awsS3;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(dataProductName: string): Promise<DomainOutput> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', dataProductName);

      const [
        dataProductObject,
        dataProductProducerInfoObject,
        dataProductInputsObject,
        dataProductOutputsObject,
        dataProductVisibilityObject,
        dataProductConsumersObject
      ] = await Promise.all([
        this.awsS3.getS3Object<DataProductObject>(
          `${ dataProductName }/${ AssetName.dataProduct }`
        ),
        this.awsS3.getS3Object<DataProductProducerInfoObject>(
          `${ dataProductName }/${ AssetName.dataProductProducerInfo }`
        ),
        this.awsS3.getS3Object<DataProductInputsObject>(
          `${ dataProductName }/${ AssetName.dataProductInputs }`
        ),
        this.awsS3.getS3Object<DataProductOutputsObject>(
          `${ dataProductName }/${ AssetName.dataProductOutputs }`
        ),
        this.awsS3.getS3Object<DataProductVisibilityObject>(
          `${ dataProductName }/${ AssetName.dataProductVisibility }`
        ),
        this.awsS3.getS3Object<DataProductConsumersObject>(
          `${ dataProductName }/${ AssetName.dataProductConsumers }`
        )
      ]);

      this.logger.debug('Data Product Object: ', dataProductObject);
      this.logger.debug('Data Product Producer Info Object: ', dataProductProducerInfoObject);
      this.logger.debug('Data Product Inputs Object: ', dataProductInputsObject);
      this.logger.debug('Data Product Outputs Object: ', dataProductOutputsObject);
      this.logger.debug('Data Product Visibility Asset: ', dataProductVisibilityObject);
      this.logger.debug('Data Product Consumers Asset: ', dataProductConsumersObject);
      this.logger.info('Finishing');

      return {
        dataProductObject,
        dataProductProducerInfoObject,
        dataProductInputsObject,
        dataProductOutputsObject,
        dataProductVisibilityObject,
        dataProductConsumersObject
      };
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
