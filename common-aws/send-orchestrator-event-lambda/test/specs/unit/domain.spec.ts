import { Logger } from '@adidas-data-mesh/common';
import { DetailType, Domain, EventSources } from '../../../src/domain';

const logger = Logger.silent();

const dataProductName = 'dataProductName';
const journeySource = EventSources.producer;
const invokedFunctionArn = 'invokedFunctionArn';
const awsEventBridge: any = {};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsEventBridge.sendEventJourney = jest.fn(async () => Promise.resolve({}));
  });

  it('Should execute the domain successfully', async () => {
    const domain = new Domain({ awsEventBridge, logger });

    await domain.execute(dataProductName, journeySource, invokedFunctionArn);

    expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(1);
    expect(awsEventBridge.sendEventJourney).toHaveBeenCalledWith({
      eventSource: journeySource,
      detailType: DetailType.finish,
      dataProductName,
      resourcesArnEventReferences: [ invokedFunctionArn ]
    });
  });

  it('Should execute the domain successfully transforming snake to kebab case', async () => {
    const domain = new Domain({ awsEventBridge, logger });

    await domain.execute('data_product_name', journeySource, invokedFunctionArn);

    expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(1);
    expect(awsEventBridge.sendEventJourney).toHaveBeenCalledWith({
      eventSource: journeySource,
      detailType: DetailType.finish,
      dataProductName: 'data-product-name',
      resourcesArnEventReferences: [ invokedFunctionArn ]
    });
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsEventBridge, logger });
    const unexpectedError = new Error('There has been an error');

    awsEventBridge.sendEventJourney = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(dataProductName, journeySource, invokedFunctionArn))
        .rejects.toThrow(unexpectedError);
    expect(awsEventBridge.sendEventJourney).toHaveBeenCalledTimes(1);
    expect(awsEventBridge.sendEventJourney).toHaveBeenCalledWith({
      eventSource: journeySource,
      detailType: DetailType.finish,
      dataProductName,
      resourcesArnEventReferences: [ invokedFunctionArn ]
    });
  });
});
