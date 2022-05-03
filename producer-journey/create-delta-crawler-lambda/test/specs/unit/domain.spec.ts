import { Logger } from '@adidas-data-mesh/common';
import { Domain } from '../../../src/domain';

const logger = Logger.silent();

const lakeRoleSessionName = 'lakeRoleSessionName';
const accountId = 'accountId';
const domainInput = 'domainInput';

const deltaTables = [
  's3://mesh-lab-product-b/orders_local_delta_db/',
  's3://mesh-lab-product-b/orders_local/',
  's3://mesh-lab-product-b/orders/'
];
const awsGlue: any = {};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsGlue.createDeltaCrawler = jest.fn().mockResolvedValue({});
  });

  it('Should execute the domain successfully and call addVisibilityLFTagToTable', async () => {
    const domain = new Domain({ awsGlue, lakeRoleSessionName, accountId, logger });
    const glueDatabaseName = domainInput;
    const crawlerRoleArn = `arn:aws:iam::${ accountId }:role/${ lakeRoleSessionName }`;

    await domain.execute(domainInput);

    expect(awsGlue.createDeltaCrawler).toHaveBeenCalledTimes(1);
    expect(awsGlue.createDeltaCrawler).toHaveBeenCalledWith(glueDatabaseName, deltaTables, crawlerRoleArn);
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsGlue, lakeRoleSessionName, accountId, logger });
    const unexpectedError = new Error('There has been an error');
    const glueDatabaseName = domainInput;
    const crawlerRoleArn = `arn:aws:iam::${ accountId }:role/${ lakeRoleSessionName }`;

    awsGlue.createDeltaCrawler = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(domainInput))
        .rejects.toThrow(unexpectedError);
    expect(awsGlue.createDeltaCrawler).toHaveBeenCalledTimes(1);
    expect(awsGlue.createDeltaCrawler).toHaveBeenCalledWith(glueDatabaseName, deltaTables, crawlerRoleArn);
  });
});
