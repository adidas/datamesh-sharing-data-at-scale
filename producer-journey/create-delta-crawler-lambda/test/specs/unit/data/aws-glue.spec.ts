import { Logger } from '@adidas-data-mesh/common';
import { AwsGlue } from '../../../../src/data/aws-glue';

const logger = Logger.silent();

const glue: any = {};
const lakeRoleSessionName = 'lakeRoleSessionName';
const accountId = 'accountId';
const deltaCrawlerName = 'deltaCrawlerName';
const crawlerRoleArn = `arn:aws:iam::${ accountId }:role/${ lakeRoleSessionName }`;
const deltaTables = [
  's3://mesh-lab-product-b/orders_local_delta_db/',
  's3://mesh-lab-product-b/orders_local/',
  's3://mesh-lab-product-b/orders/'
];
const params = {
  Targets: {
    DeltaTargets: [
      {
        DeltaTables: deltaTables,
        WriteManifest: true
      }
    ]
  },
  Schedule: 'cron(0 20 * * ? *)',
  Configuration: '{"Version":1,"Grouping":{"TableLevelConfiguration":2}}',
  DatabaseName: deltaCrawlerName,
  Name: deltaCrawlerName,
  SchemaChangePolicy: {
    DeleteBehavior: 'DEPRECATE_IN_DATABASE',
    UpdateBehavior: 'UPDATE_IN_DATABASE'
  },
  Role: crawlerRoleArn
};
const createCrawlerMock = jest.fn(async () => Promise.resolve());

describe('# AwsGlue', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    glue.createCrawler = jest.fn(() => ({ promise: createCrawlerMock }));
  });

  describe('createDeltaCrawler()', () => {
    it('Should createDeltaCrawler successfully', async () => {
      const awsGlue = new AwsGlue(glue, logger);

      await awsGlue.createDeltaCrawler(deltaCrawlerName, deltaTables, crawlerRoleArn);

      expect(createCrawlerMock).toHaveBeenCalledTimes(1);
      expect(glue.createCrawler).toHaveBeenCalledTimes(1);
      expect(glue.createCrawler).toHaveBeenCalledWith(params);
    });

    it('Should throw an error since aws has failed', async () => {
      const awsGlue = new AwsGlue(glue, logger);
      const unexpectedError = new Error('There has been an error');

      createCrawlerMock.mockRejectedValueOnce(unexpectedError);

      await expect(async () => awsGlue.createDeltaCrawler(deltaCrawlerName, deltaTables, crawlerRoleArn))
        .rejects.toThrow(unexpectedError);
      expect(createCrawlerMock).toHaveBeenCalledTimes(1);
      expect(glue.createCrawler).toHaveBeenCalledTimes(1);
      expect(glue.createCrawler).toHaveBeenCalledWith(params);
    });
  });
});
