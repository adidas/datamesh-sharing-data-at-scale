import { Logger } from '@adidas-data-mesh/common';
import { AwsEventBridge, DetailType, EventSources } from '../../../../src/data/aws-event-bridge';

const logger = Logger.silent();

const eventBusArn = 'eventBusArn';
const eventBridge: any = {};

const dataProductName = 'dataProductName';
const detailType = DetailType.create;
const eventSource = EventSources.consumer;
const resourcesArnEventReferences = [ 'resourcesArnEventReferences' ];
const putEventsMock: any = {};

describe('# AwsEventBridge', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    eventBridge.putEvents = jest.fn(() => ({ promise: async () => Promise.resolve(putEventsMock) }));
  });

  it('Should sendEventJourney successfully', async () => {
    const awsEventBridge = new AwsEventBridge(eventBridge, eventBusArn, logger);

    await awsEventBridge.sendEventJourney({ eventSource, detailType, resourcesArnEventReferences, dataProductName });

    expect(eventBridge.putEvents).toHaveBeenCalledTimes(1);
    expect(eventBridge.putEvents).toHaveBeenCalledWith({
      Entries: [
        {
          Detail: JSON.stringify({
            dataProductName
          }),
          DetailType: detailType,
          EventBusName: eventBusArn,
          Resources: resourcesArnEventReferences,
          Source: eventSource
        }
      ]
    });
  });

  it('Should sendEventJourney return an error since eventBridge has failed', async () => {
    const awsEventBridge = new AwsEventBridge(eventBridge, eventBusArn, logger);
    const unexpectedError = new Error('Unexpected error');

    eventBridge.putEvents =
      jest.fn(() => ({ promise: async () => Promise.reject(unexpectedError) }));

    await expect(async () => awsEventBridge.sendEventJourney({
      eventSource, detailType, resourcesArnEventReferences, dataProductName
    })).rejects.toThrowError(unexpectedError);
    expect(eventBridge.putEvents).toHaveBeenCalledTimes(1);
    expect(eventBridge.putEvents).toHaveBeenCalledWith({
      Entries: [
        {
          Detail: JSON.stringify({
            dataProductName
          }),
          DetailType: detailType,
          EventBusName: eventBusArn,
          Resources: resourcesArnEventReferences,
          Source: eventSource
        }
      ]
    });
  });
});
