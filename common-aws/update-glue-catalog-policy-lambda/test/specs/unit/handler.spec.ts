import { Logger } from '@adidas-data-mesh/common';
import { Handler } from '../../../src/handler';

const logger = Logger.silent();

const accountId1 = 'accountId1';
const accountId2 = 'accountId2';
const handlerInput: any = {
  Records: [
    {
      body: accountId1
    }, {
      body: accountId2
    }
  ]
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

    await handler.execute(executeInput);

    expect(domain.execute).toHaveBeenCalledTimes(2);
    expect(domain.execute).toHaveBeenNthCalledWith(1, accountId1);
    expect(domain.execute).toHaveBeenNthCalledWith(2, accountId2);
  });

  it('Should throw an error since the domain has failed', async () => {
    const handler = new Handler(domain, logger);
    const executeInput = handlerInput;
    const unexpectedError = new Error('There has been an error');

    domain.execute = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => handler.execute(executeInput))
        .rejects.toThrow(unexpectedError);

    expect(domain.execute).toHaveBeenCalledTimes(1);
    expect(domain.execute).toHaveBeenNthCalledWith(1, accountId1);
  });
});
