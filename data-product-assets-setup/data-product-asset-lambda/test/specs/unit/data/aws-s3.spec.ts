import { Logger } from '@adidas-data-mesh/common';
import { AwsS3 } from '../../../../src/data/aws-s3';
import { DataProductAsset } from '../../../../src/data-product-assets.model';

const logger = Logger.silent();

const bucketName = 'bucketName';
const bucketKey = 'bucketKey';
const dataProductAsset: DataProductAsset = {
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
const s3: any = {};

describe('# AwsS3', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    s3.putObject = jest.fn(() => ({ promise: async () => Promise.resolve({}) }));
    s3.deleteObject = jest.fn(() => ({ promise: async () => Promise.resolve({}) }));
  });

  it('Should uploadDataProductAsset successfully', async () => {
    const awsS3 = new AwsS3(s3, logger);

    await awsS3.uploadDataProductAsset(bucketName, bucketKey, dataProductAsset);

    expect(s3.putObject).toHaveBeenCalledTimes(1);
    expect(s3.putObject).toHaveBeenCalledWith({
      Body: JSON.stringify(dataProductAsset),
      Bucket: bucketName,
      Key: bucketKey
    });
  });

  it('Should uploadDataProductAsset return an error since s3 has failed', async () => {
    const awsS3 = new AwsS3(s3, logger);
    const unexpectedError = new Error('Unexpected error');

    s3.putObject =
      jest.fn(() => ({ promise: async () => Promise.reject(unexpectedError) }));

    await expect(async () => awsS3.uploadDataProductAsset(bucketName, bucketKey, dataProductAsset))
      .rejects.toThrowError(unexpectedError);
    expect(s3.putObject).toHaveBeenCalledTimes(1);
    expect(s3.putObject).toHaveBeenCalledWith({
      Body: JSON.stringify(dataProductAsset),
      Bucket: bucketName,
      Key: bucketKey
    });
  });

  it('Should deleteDataProductAsset successfully', async () => {
    const awsS3 = new AwsS3(s3, logger);

    await awsS3.deleteDataProductAsset(bucketName, bucketKey);

    expect(s3.deleteObject).toHaveBeenCalledTimes(1);
    expect(s3.deleteObject).toHaveBeenCalledWith({
      Bucket: bucketName,
      Key: bucketKey
    });
  });

  it('Should deleteDataProductAsset return an error since s3 has failed', async () => {
    const awsS3 = new AwsS3(s3, logger);
    const unexpectedError = new Error('Unexpected error');

    s3.deleteObject =
      jest.fn(() => ({ promise: async () => Promise.reject(unexpectedError) }));

    await expect(async () => awsS3.deleteDataProductAsset(bucketName, bucketKey))
      .rejects.toThrowError(unexpectedError);
    expect(s3.deleteObject).toHaveBeenCalledTimes(1);
    expect(s3.deleteObject).toHaveBeenCalledWith({
      Bucket: bucketName,
      Key: bucketKey
    });
  });
});
