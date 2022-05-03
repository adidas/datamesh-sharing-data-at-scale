import { Logger } from '@adidas-data-mesh/common';
import {
  AssetName, CustomResourceProperties, DataProductConsumersObject, DataProductInputsObject,
  DataProductObject, DataProductOutputsObject, DataProductProducerInfoObject, DataProductVisibilityObject
} from '../../../src/data-product-assets.model';
import { DetailType, Domain, EventSources } from '../../../src/domain';

const logger = Logger.silent();
const awsS3: any = {};
const awsEventBridge: any = {};
const bucketName = 'bucketName';
const stackId = 'StackId';
const serviceToken = 'ServiceToken';
const resourcesArnEventReferences = [ serviceToken, stackId ];

const dataProductObject: DataProductObject = {
  'data-product-name': 'data-product-name',
  'data-product-owner': 'data-product-owner',
  'data-product-mantainer': 'data-product-mantainer',
  'edc-data-objects': [ 'edc-data-objects' ],
  'source-system': 'source-system',
  'enterprise-system-landscape-information-tracker': 'enterprise-system-landscape-information-tracker',
  'dq-rules': 'dq-rules',
  'usage-patterns': [ 'usage-patterns' ],
  'version': 'version'
};
const dataProductProducerInfoObject: DataProductProducerInfoObject = {
  'account-type': 'aws',
  'producer-role-arn': 'producer-role-arn',
  'producer-account-id': 'producer-account-id',
  'bucket-name': 'bucket-name'
};
const dataProductInputsObject: DataProductInputsObject = {
  inputs: {
    BDP: {
      tables: [ 'tables' ]
    }
  }
};
const dataProductOutputsObject: DataProductOutputsObject = {
  outputs: {
    'table-name': {
      'file-format': 'parquet',
      'port-type': 'blob',
      'location': 'location',
      'partition-columns': [ 'partition-columns' ],
      'retention-time': {
        unit: 'day',
        time: 2
      }
    }
  }
};
const dataProductVisibilityObject: DataProductVisibilityObject = {
  tables: [
    {
      name: 'foo',
      visibility: 'internal',
      columns: [
        {
          name: 'bar',
          pci: true
        }
      ]
    }
  ]
};
const dataProductConsumersObject: DataProductConsumersObject = {
  consumers: [
    {
      'account': '123456789123',
      'contact': 'foo.bar@adidas.com',
      'team': 'pdna',
      'enterprise-system-landscape-information-tracker': 'foobar',
      'type': 'iam',
      'consumer-role-arn': 'arn:aws:iam::123456789123:role/consumer'
    }
  ]
};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsS3.uploadDataProductAsset = jest.fn(async () => Promise.resolve({}));
    awsS3.deleteDataProductAsset = jest.fn(async () => Promise.resolve({}));
    awsEventBridge.sendEventJourney = jest.fn(async () => Promise.resolve({}));
  });

  describe('createDataProductAsset()', () => {
    it('Should execute the domain successfully for a dataProductObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProduct,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductObject
      };
      const bucketKey = `${ customResourceProperties.dataProductNameObjectKey
      }/${ customResourceProperties.assetName }`;
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        ResourceProperties: customResourceProperties
      };

      await domain.createDataProductAsset(executeInput);

      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey,
        dataProductObject
      );
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(1);
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledWith({
        eventSource: EventSources.producer,
        detailType: DetailType.create,
        dataProductName: customResourceProperties.dataProductNameObjectKey,
        resourcesArnEventReferences
      });
    });

    it('Should execute the domain successfully for a dataProductProducerInfoObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductProducerInfo,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductProducerInfoObject
      };
      const bucketKey = `${ customResourceProperties.dataProductNameObjectKey }/${ customResourceProperties.assetName }`;
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        ResourceProperties: customResourceProperties
      };

      await domain.createDataProductAsset(executeInput);

      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey,
        dataProductProducerInfoObject
      );
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(0);
    });

    it('Should execute the domain successfully for a dataProductInputsObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductInputs,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductInputsObject
      };
      const bucketKey = `${ customResourceProperties.dataProductNameObjectKey }/${ customResourceProperties.assetName }`;
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        ResourceProperties: customResourceProperties
      };

      await domain.createDataProductAsset(executeInput);

      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey,
        dataProductInputsObject
      );
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(0);
    });

    it('Should execute the domain successfully for a dataProductOutputsObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductOutputs,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductOutputsObject
      };
      const bucketKey = `${ customResourceProperties.dataProductNameObjectKey }/${ customResourceProperties.assetName }`;
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        ResourceProperties: customResourceProperties
      };

      await domain.createDataProductAsset(executeInput);

      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey,
        dataProductOutputsObject
      );
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(0);
    });

    it('Should execute the domain successfully for a dataProductVisibilityObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductVisibility,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductVisibilityObject
      };
      const bucketKey = `${ customResourceProperties.dataProductNameObjectKey
      }/${ customResourceProperties.assetName }`;
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        ResourceProperties: customResourceProperties
      };

      await domain.createDataProductAsset(executeInput);

      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey,
        dataProductVisibilityObject
      );
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(1);
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledWith({
        eventSource: EventSources.visibility,
        detailType: DetailType.create,
        dataProductName: customResourceProperties.dataProductNameObjectKey,
        resourcesArnEventReferences
      });
    });

    it('Should execute the domain successfully for a dataProductConsumersObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductConsumers,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductConsumersObject
      };
      const bucketKey = `${ customResourceProperties.dataProductNameObjectKey
      }/${ customResourceProperties.assetName }`;
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        ResourceProperties: customResourceProperties
      };

      await domain.createDataProductAsset(executeInput);

      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey,
        dataProductConsumersObject
      );
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(1);
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledWith({
        eventSource: EventSources.consumer,
        detailType: DetailType.create,
        dataProductName: customResourceProperties.dataProductNameObjectKey,
        resourcesArnEventReferences
      });
    });

    it('Should failed since dataProductObject is not properly set', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const dataProductObject = {
        'data-product-name': 'data-product-name'
      };
      const customResourceProperties = {
        assetName: AssetName.dataProduct,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductObject
      };
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        ResourceProperties: customResourceProperties
      };
      const error = new Error('A data product file is not set properly');

      await expect(async () => domain.createDataProductAsset(executeInput))
          .rejects.toThrow(error);
    });
  });

  describe('updateDataProductAsset()', () => {
    it('Should execute the domain successfully for a dataProductObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProduct,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductObject
      };
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        PhysicalResourceId: 'PhysicalResourceId',
        OldResourceProperties: customResourceProperties,
        ResourceProperties: customResourceProperties
      };
      const bucketKey = executeInput.PhysicalResourceId;

      await domain.updateDataProductAsset(executeInput);

      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey,
        dataProductObject
      );
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(1);
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledWith({
        eventSource: EventSources.producer,
        detailType: DetailType.update,
        dataProductName: customResourceProperties.dataProductNameObjectKey,
        resourcesArnEventReferences
      });
    });

    it('Should execute the domain successfully for a dataProductProducerInfoObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductProducerInfo,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductProducerInfoObject
      };
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        PhysicalResourceId: 'PhysicalResourceId',
        OldResourceProperties: customResourceProperties,
        ResourceProperties: customResourceProperties
      };
      const bucketKey = executeInput.PhysicalResourceId;

      await domain.updateDataProductAsset(executeInput);

      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey,
        dataProductProducerInfoObject
      );
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(0);
    });

    it('Should execute the domain successfully for a dataProductInputsObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductInputs,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductInputsObject
      };
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        PhysicalResourceId: 'PhysicalResourceId',
        OldResourceProperties: customResourceProperties,
        ResourceProperties: customResourceProperties
      };
      const bucketKey = executeInput.PhysicalResourceId;

      await domain.updateDataProductAsset(executeInput);

      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey,
        dataProductInputsObject
      );
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(0);
    });

    it('Should execute the domain successfully for a dataProductOutputsObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductOutputs,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductOutputsObject
      };
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        PhysicalResourceId: 'PhysicalResourceId',
        OldResourceProperties: customResourceProperties,
        ResourceProperties: customResourceProperties
      };
      const bucketKey = executeInput.PhysicalResourceId;

      await domain.updateDataProductAsset(executeInput);

      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey,
        dataProductOutputsObject
      );
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(0);
    });

    it('Should execute the domain successfully for a dataProductVisibilityObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductVisibility,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductVisibilityObject
      };
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        PhysicalResourceId: 'PhysicalResourceId',
        OldResourceProperties: customResourceProperties,
        ResourceProperties: customResourceProperties
      };
      const bucketKey = executeInput.PhysicalResourceId;

      await domain.updateDataProductAsset(executeInput);

      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey,
        dataProductVisibilityObject
      );
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(1);
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledWith({
        eventSource: EventSources.visibility,
        detailType: DetailType.update,
        dataProductName: customResourceProperties.dataProductNameObjectKey,
        resourcesArnEventReferences
      });
    });

    it('Should execute the domain successfully for a dataProductConsumersObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductConsumers,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductConsumersObject
      };
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        PhysicalResourceId: 'PhysicalResourceId',
        OldResourceProperties: customResourceProperties,
        ResourceProperties: customResourceProperties
      };
      const bucketKey = executeInput.PhysicalResourceId;

      await domain.updateDataProductAsset(executeInput);

      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.uploadDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey,
        dataProductConsumersObject
      );
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(1);
      expect(awsEventBridge.sendEventJourney).toHaveBeenCalledWith({
        eventSource: EventSources.consumer,
        detailType: DetailType.update,
        dataProductName: customResourceProperties.dataProductNameObjectKey,
        resourcesArnEventReferences
      });
    });

    it('Should failed since dataProductObject is not properly set', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const dataProductObject = {
        'data-product-name': 'data-product-name'
      };
      const customResourceProperties = {
        assetName: AssetName.dataProduct,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductObject
      };
      const executeInput: any = {
        StackId: stackId,
        ServiceToken: serviceToken,
        ResourceProperties: customResourceProperties
      };
      const error = new Error('A data product file is not set properly');

      await expect(async () => domain.updateDataProductAsset(executeInput))
          .rejects.toThrow(error);
    });
  });

  describe('deleteDataProductAsset()', () => {
    it('Should execute the domain successfully for a dataProductObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const executeInput: any = {
        PhysicalResourceId: 'PhysicalResourceId'
      };
      const bucketKey = executeInput.PhysicalResourceId;

      await domain.deleteDataProductAsset(executeInput);

      expect(awsS3.deleteDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.deleteDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey
      );
    });

    it('Should execute the domain successfully for a dataProductProducerInfoObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductProducerInfo,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductProducerInfoObject
      };
      const executeInput: any = {
        PhysicalResourceId: 'PhysicalResourceId',
        OldResourceProperties: customResourceProperties,
        ResourceProperties: customResourceProperties
      };
      const bucketKey = executeInput.PhysicalResourceId;

      await domain.deleteDataProductAsset(executeInput);

      expect(awsS3.deleteDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.deleteDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey
      );
    });

    it('Should execute the domain successfully for a dataProductInputsObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductInputs,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductInputsObject
      };
      const executeInput: any = {
        PhysicalResourceId: 'PhysicalResourceId',
        OldResourceProperties: customResourceProperties,
        ResourceProperties: customResourceProperties
      };
      const bucketKey = executeInput.PhysicalResourceId;

      await domain.deleteDataProductAsset(executeInput);

      expect(awsS3.deleteDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.deleteDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey
      );
    });

    it('Should execute the domain successfully for a dataProductOutputsObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductOutputs,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductOutputsObject
      };
      const executeInput: any = {
        PhysicalResourceId: 'PhysicalResourceId',
        OldResourceProperties: customResourceProperties,
        ResourceProperties: customResourceProperties
      };
      const bucketKey = executeInput.PhysicalResourceId;

      await domain.deleteDataProductAsset(executeInput);

      expect(awsS3.deleteDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.deleteDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey
      );
    });

    it('Should execute the domain successfully for a dataProductVisibilityObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const executeInput: any = {
        PhysicalResourceId: 'PhysicalResourceId'
      };
      const bucketKey = executeInput.PhysicalResourceId;

      await domain.deleteDataProductAsset(executeInput);

      expect(awsS3.deleteDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.deleteDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey
      );
    });

    it('Should execute the domain successfully for a dataProductConsumersObject', async () => {
      const domain = new Domain({ bucketName, awsS3, awsEventBridge, logger });
      const customResourceProperties: CustomResourceProperties = {
        assetName: AssetName.dataProductConsumers,
        dataProductNameObjectKey: 'dataProductNameObjectKey',
        ...dataProductConsumersObject
      };
      const executeInput: any = {
        PhysicalResourceId: 'PhysicalResourceId',
        OldResourceProperties: customResourceProperties,
        ResourceProperties: customResourceProperties
      };
      const bucketKey = executeInput.PhysicalResourceId;

      await domain.deleteDataProductAsset(executeInput);

      expect(awsS3.deleteDataProductAsset).toHaveBeenCalledTimes(1);
      expect(awsS3.deleteDataProductAsset).toHaveBeenCalledWith(
        bucketName,
        bucketKey
      );
    });
  });
});
