import { Logger } from '@adidas-data-mesh/common';
import { EventSources, Handler, HandlerInput } from '../../../src/handler';

const logger = Logger.silent();

const handlerInput: HandlerInput = {
  dataProductObject: {
    'data-product-name': 'data-product-name'
  },
  journeySource: EventSources.producer
};
const contextLambda: any = {
  invokedFunctionArn: 'invokedFunctionArn'
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
      handlerInput.dataProductObject['data-product-name'],
      handlerInput.journeySource,
      contextLambda.invokedFunctionArn
    ];

    await handler.execute(executeInput, contextLambda);

    expect(domain.execute).toHaveBeenCalledTimes(1);
    expect(domain.execute).toHaveBeenCalledWith(...domainInput);
  });

  it('Should throw an error since the domain has failed', async () => {
    const handler = new Handler(domain, logger);
    const executeInput = handlerInput;
    const domainInput = [
      handlerInput.dataProductObject['data-product-name'],
      handlerInput.journeySource,
      contextLambda.invokedFunctionArn
    ];
    const unexpectedError = new Error('There has been an error');

    domain.execute = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => handler.execute(executeInput, contextLambda))
        .rejects.toThrow(unexpectedError);
    expect(domain.execute).toHaveBeenCalledTimes(1);
    expect(domain.execute).toHaveBeenCalledWith(...domainInput);
  });
});
