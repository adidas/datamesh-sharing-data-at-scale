import { Logger } from '@adidas-data-mesh/common';
import {
  CloudFormationCustomResourceCreateEvent, CloudFormationCustomResourceDeleteEvent,
  CloudFormationCustomResourceUpdateEvent
} from 'aws-lambda';
import { AwsS3 } from './data/aws-s3';
import {
  CustomResourceProperties, DataProductAsset, DataProductConsumersObject, DataProductInputsObject, DataProductObject,
  DataProductOutputsObject, DataProductProducerInfoObject, DataProductVisibilityObject,
  isDataProductConsumersObject, isDataProductInputsObject, isDataProductObject, isDataProductOutputsObject,
  isDataProductProducerInfoObject, isDataProductVisibilityObject
} from './data-product-assets.model';
import { AwsEventBridge } from './data/aws-event-bridge';

type DomainConfig = {
  readonly bucketName: string;
  readonly awsS3: AwsS3;
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

type DataObjectAndEventSource = {
  dataObject: DataProductAsset;
  eventSource?: EventSources;
};

export class Domain {
  private readonly bucketName: string;
  private readonly awsS3: AwsS3;
  private readonly awsEventBridge: AwsEventBridge;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';
  private dataProductName?: string;
  private resourcesArnEventReferences: Array<string> = [];

  public constructor({
    bucketName, awsS3, awsEventBridge, logger
  }: DomainConfig) {
    this.bucketName = bucketName;
    this.awsS3 = awsS3;
    this.awsEventBridge = awsEventBridge;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async createDataProductAsset({
    ResourceProperties, ServiceToken, StackId
  }: CloudFormationCustomResourceCreateEvent): Promise<string> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', ResourceProperties);

      const customResourceProperties = ResourceProperties as unknown as CustomResourceProperties;
      const { assetName, dataProductNameObjectKey } = customResourceProperties;
      const bucketKey = `${ dataProductNameObjectKey }/${ assetName }`;

      this.dataProductName = dataProductNameObjectKey;
      this.resourcesArnEventReferences = [ ServiceToken, StackId ];

      await this.manageCreateAndUpdateObjectFile(bucketKey, DetailType.create, customResourceProperties);

      this.logger.info('Finishing');

      return bucketKey;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async updateDataProductAsset({
    ResourceProperties, PhysicalResourceId, OldResourceProperties, ServiceToken, StackId
  }: CloudFormationCustomResourceUpdateEvent): Promise<string> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', ResourceProperties, PhysicalResourceId, OldResourceProperties);

      const customResourceProperties = ResourceProperties as unknown as CustomResourceProperties;
      const { dataProductNameObjectKey } = customResourceProperties;
      const bucketKey = PhysicalResourceId;

      this.dataProductName = dataProductNameObjectKey;
      this.resourcesArnEventReferences = [ ServiceToken, StackId ];

      await this.manageCreateAndUpdateObjectFile(bucketKey, DetailType.update, customResourceProperties);

      this.logger.info('Finishing');

      return PhysicalResourceId;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async deleteDataProductAsset({
    PhysicalResourceId
  }: CloudFormationCustomResourceDeleteEvent): Promise<string> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', PhysicalResourceId);

      const bucketKey = PhysicalResourceId;

      this.logger.info('Finishing');

      await this.awsS3.deleteDataProductAsset(
        this.bucketName,
        bucketKey
      );

      return PhysicalResourceId;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  private async manageCreateAndUpdateObjectFile(
      bucketKey: string, eventDetailType: DetailType, customResourceProperties: CustomResourceProperties
  ) {
    const { dataObject, eventSource } = this.getDataObjectAndEventSource(customResourceProperties);

    await this.awsS3.uploadDataProductAsset(
      this.bucketName,
      bucketKey,
      dataObject
    );

    if (eventSource) {
      await this.awsEventBridge.sendEventJourney({
        eventSource,
        detailType: eventDetailType,
        dataProductName: this.dataProductName ?? '',
        resourcesArnEventReferences: this.resourcesArnEventReferences
      });
    }
  }

  private getDataObjectAndEventSource(
      customResourceProperties: CustomResourceProperties
  ): DataObjectAndEventSource {
    if (isDataProductObject(customResourceProperties)) {
      return {
        dataObject: this.getDataProductFromCRProperties(customResourceProperties),
        eventSource: EventSources.producer
      };
    } else if (isDataProductInputsObject(customResourceProperties)) {
      return {
        dataObject: this.getDataProductInputsFromCRProperties(customResourceProperties)
      };
    } else if (isDataProductOutputsObject(customResourceProperties)) {
      return {
        dataObject: this.getDataProductOutputsFromCRProperties(customResourceProperties)
      };
    } else if (isDataProductProducerInfoObject(customResourceProperties)) {
      return {
        dataObject: this.getDataProductProducerInfoFromCRProperties(customResourceProperties)
      };
    } else if (isDataProductVisibilityObject(customResourceProperties)) {
      return {
        dataObject: this.getDataProductVisibilityFromCRProperties(customResourceProperties),
        eventSource: EventSources.visibility
      };
    } else if (isDataProductConsumersObject(customResourceProperties)) {
      return {
        dataObject: this.getDataProductConsumersFromCRProperties(customResourceProperties),
        eventSource: EventSources.consumer
      };
    }

    throw new Error('A data product file is not set properly');
  }

  private getDataProductFromCRProperties(customResourceProperties: DataProductObject): DataProductObject {
    return {
      'data-product-name': customResourceProperties['data-product-name'],
      'data-product-owner': customResourceProperties['data-product-owner'],
      'data-product-mantainer': customResourceProperties['data-product-mantainer'],
      'source-system': customResourceProperties['source-system'],
      'edc-data-objects': customResourceProperties['edc-data-objects'],
      'enterprise-system-landscape-information-tracker': customResourceProperties['enterprise-system-landscape-information-tracker'],
      'usage-patterns': customResourceProperties['usage-patterns'],
      'dq-rules': customResourceProperties['dq-rules'],
      'version': customResourceProperties.version
    };
  }

  private getDataProductProducerInfoFromCRProperties(
      customResourceProperties: DataProductProducerInfoObject
  ): DataProductProducerInfoObject {
    return {
      'account-type': customResourceProperties['account-type'],
      'producer-role-arn': customResourceProperties['producer-role-arn'],
      'producer-account-id': customResourceProperties['producer-account-id'],
      'bucket-name': customResourceProperties['bucket-name']
    };
  }

  private getDataProductInputsFromCRProperties(
      customResourceProperties: DataProductInputsObject
  ): DataProductInputsObject {
    return {
      inputs: customResourceProperties.inputs
    };
  }

  private getDataProductOutputsFromCRProperties(
      customResourceProperties: DataProductOutputsObject
  ): DataProductOutputsObject {
    return {
      outputs: customResourceProperties.outputs
    };
  }
  private getDataProductVisibilityFromCRProperties(
      customResourceProperties: DataProductVisibilityObject
  ): DataProductVisibilityObject {
    return {
      tables: customResourceProperties.tables
    };
  }

  private getDataProductConsumersFromCRProperties(
      customResourceProperties: DataProductConsumersObject
  ): DataProductConsumersObject {
    return {
      consumers: customResourceProperties.consumers
    };
  }
}
