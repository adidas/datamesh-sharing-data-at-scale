import { Logger } from '@adidas-data-mesh/common';
import { HandlerInput, Handler } from '../../../src/handler';

const logger = Logger.silent();

const handlerInput: HandlerInput = {
  dataProductProducerInfoObject: {
    'producer-role-arn': 'producer-role-arn',
    'bucket-name': 'bucket-name'
  },
  currentConsumer: {
    account: 'account'
  }
};
const domain: any = {};

describe('# Handler', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    domain.execute = jest.fn(async () => Promise.resolve());
  });

  it('Should execute the handler successfully', async () => {
    const handler = new Handler(domain, logger);
    const executeInput = handlerInput;
    const domainInput = [
      executeInput.dataProductProducerInfoObject['bucket-name'],
      executeInput.dataProductProducerInfoObject['producer-role-arn'],
      executeInput.currentConsumer.account
    ];

    await handler.execute(executeInput);

    expect(domain.execute).toHaveBeenCalledTimes(1);
    expect(domain.execute).toHaveBeenCalledWith(...domainInput);
  });

  it('Should throw an error since the domain has failed', async () => {
    const handler = new Handler(domain, logger);
    const executeInput = handlerInput;
    const domainInput = [
      executeInput.dataProductProducerInfoObject['bucket-name'],
      executeInput.dataProductProducerInfoObject['producer-role-arn'],
      executeInput.currentConsumer.account
    ];
    const unexpectedError = new Error('There has been an error');

    domain.execute = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => handler.execute(executeInput))
        .rejects.toThrow(unexpectedError);
    expect(domain.execute).toHaveBeenCalledTimes(1);
    expect(domain.execute).toHaveBeenCalledWith(...domainInput);
  });
});
