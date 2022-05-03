import { Logger } from '@adidas-data-mesh/common';
import { HandlerInput, Handler, DataProductVisibilityObject } from '../../../src/handler';

const logger = Logger.silent();

const dataProductVisibilityObject: DataProductVisibilityObject = {
  tables: [
    {
      name: 'tableName',
      visibility: 'internal',
      columns: [
        {
          name: 'columnName',
          pci: true
        }
      ]
    }
  ]
};

const handlerInput: HandlerInput = {
  dataProductVisibilityObject,
  glueDatabaseName: 'glueDatabaseName'
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
    const domainInput = executeInput;

    await handler.execute(executeInput);

    expect(domain.execute).toHaveBeenCalledTimes(1);
    expect(domain.execute).toHaveBeenCalledWith(domainInput);
  });

  it('Should throw an error since the domain has failed', async () => {
    const handler = new Handler(domain, logger);
    const executeInput = handlerInput;
    const domainInput = executeInput;
    const unexpectedError = new Error('There has been an error');

    domain.execute = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => handler.execute(executeInput))
        .rejects.toThrow(unexpectedError);
    expect(domain.execute).toHaveBeenCalledTimes(1);
    expect(domain.execute).toHaveBeenCalledWith(domainInput);
  });
});
