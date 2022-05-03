import { Logger } from '@adidas-data-mesh/common';
import { DataProductVisibilityObject, Domain, DomainInput } from '../../../src/domain';

const logger = Logger.silent();

const lakeRoleSessionName = 'lakeRoleSessionName';
const accountId = 'accountId';
const dataProductVisibilityObject: DataProductVisibilityObject = {
  tables: [
    {
      name: 'tableName',
      visibility: 'internal',
      columns: [
        {
          name: 'columnName1',
          pci: true
        },
        {
          name: 'columnName2',
          pii: true
        }
      ]
    },
    {
      name: 'tableName',
      visibility: 'internal'
    }
  ]
};

const domainInput: DomainInput = {
  dataProductVisibilityObject,
  glueDatabaseName: 'glueDatabaseName'
};
const newCredentials = {
  accessKeyId: 'accessKeyId',
  secretAccessKey: 'secretAccessKey',
  sessionToken: 'sessionToken'
};
const awsLakeFormation: any = {};
const awsSts: any = {};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsSts.getRoleCredentials = jest.fn(async () => Promise.resolve(newCredentials));
    awsLakeFormation.withNewCredentials = jest.fn().mockResolvedValue(awsLakeFormation);
    awsLakeFormation.addVisibilityLFTagToTable = jest.fn().mockResolvedValue({});
    awsLakeFormation.addLFTagsToTableColumns = jest.fn().mockResolvedValue({});
  });

  it('Should assume the producer role for awsLakeFormation', async () => {
    const domain = new Domain({ awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });

    await domain.execute(domainInput);

    expect(awsSts.getRoleCredentials).toHaveBeenCalledTimes(1);
    expect(awsSts.getRoleCredentials).toHaveBeenCalledWith(lakeRoleSessionName, accountId);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.withNewCredentials).toHaveBeenCalledWith(newCredentials);
  });

  it('Should execute the domain successfully and call addVisibilityLFTagToTable', async () => {
    const domain = new Domain({ awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });
    const [ tableInput1, tableInput2 ] = domainInput.dataProductVisibilityObject.tables;

    await domain.execute(domainInput);

    expect(awsLakeFormation.addVisibilityLFTagToTable).toHaveBeenCalledTimes(2);
    expect(awsLakeFormation.addVisibilityLFTagToTable).toHaveBeenNthCalledWith(1, {
      databaseName: domainInput.glueDatabaseName,
      tableName: tableInput1.name,
      visibility: tableInput1.visibility
    });
    expect(awsLakeFormation.addVisibilityLFTagToTable).toHaveBeenNthCalledWith(2, {
      databaseName: domainInput.glueDatabaseName,
      tableName: tableInput2.name,
      visibility: tableInput2.visibility
    });
  });

  it('Should execute the domain successfully and call addLFTagsToTableColumns', async () => {
    const domain = new Domain({ awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });
    const [ tableInput ] = domainInput.dataProductVisibilityObject.tables;
    const [ column1, column2 ] = tableInput.columns ?? [];

    await domain.execute(domainInput);

    expect(awsLakeFormation.addLFTagsToTableColumns).toHaveBeenCalledTimes(2);
    expect(awsLakeFormation.addLFTagsToTableColumns).toHaveBeenNthCalledWith(1, {
      databaseName: domainInput.glueDatabaseName,
      tableName: tableInput.name,
      columnName: column1.name,
      columnTagKey: 'pci',
      columnTagValue: column1.pci
    });
    expect(awsLakeFormation.addLFTagsToTableColumns).toHaveBeenNthCalledWith(2, {
      databaseName: domainInput.glueDatabaseName,
      tableName: tableInput.name,
      columnName: column2.name,
      columnTagKey: 'pii',
      columnTagValue: column2.pii
    });
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsLakeFormation, accountId, lakeRoleSessionName, awsSts, logger });
    const unexpectedError = new Error('There has been an error');
    const [ tableInput1 ] = domainInput.dataProductVisibilityObject.tables;

    awsLakeFormation.addVisibilityLFTagToTable = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(domainInput))
        .rejects.toThrow(unexpectedError);
    expect(awsLakeFormation.addVisibilityLFTagToTable).toHaveBeenCalledTimes(1);
    expect(awsLakeFormation.addVisibilityLFTagToTable).toHaveBeenNthCalledWith(1, {
      databaseName: domainInput.glueDatabaseName,
      tableName: tableInput1.name,
      visibility: tableInput1.visibility
    });
  });
});
