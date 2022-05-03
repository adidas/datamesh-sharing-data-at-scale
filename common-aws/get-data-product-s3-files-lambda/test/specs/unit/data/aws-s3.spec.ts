import { Logger } from '@adidas-data-mesh/common';
import { AwsS3 } from '../../../../src/data/aws-s3';

const logger = Logger.silent();

const dataProductCatalogueBucket = 'dataProductCatalogueBucket';
const s3: any = {};
const s3Object = { foo: 'bar' };
const s3Response = {
  Body: Buffer.from(JSON.stringify(s3Object))
};
const getObjectMock = jest.fn(async () => Promise.resolve(s3Response));

describe('# AwsS3', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    s3.getObject = jest.fn(() => ({ promise: getObjectMock }));
  });

  it('Should getS3Object successfully', async () => {
    const awsS3 = new AwsS3(dataProductCatalogueBucket, s3, logger);
    const awsInput = 'object.json';

    const response = await awsS3.getS3Object(awsInput);

    expect(getObjectMock).toHaveBeenCalledTimes(1);
    expect(s3.getObject).toHaveBeenCalledTimes(1);
    expect(s3.getObject).toHaveBeenCalledWith({
      Bucket: dataProductCatalogueBucket,
      Key: awsInput
    });
    expect(response).toEqual(s3Object);
  });

  it('Should throw an error since no object has been found', async () => {
    const awsS3 = new AwsS3(dataProductCatalogueBucket, s3, logger);
    const awsInput = 'object.json';
    const unexpectedError = new Error(`No data product visibility s3 object file has been found for ${
      awsInput }`);

    getObjectMock.mockResolvedValue(Promise.resolve({} as any));

    await expect(async () => awsS3.getS3Object(awsInput))
        .rejects.toThrow(unexpectedError);
    expect(getObjectMock).toHaveBeenCalledTimes(1);
    expect(s3.getObject).toHaveBeenCalledTimes(1);
    expect(s3.getObject).toHaveBeenCalledWith({
      Bucket: dataProductCatalogueBucket,
      Key: awsInput
    });
  });
});
