import { Construct } from '@aws-cdk/core';
import { DataProductCatalogTable } from '../../../../cdk/lib/register-data-product-in-confluence/dynamodb-table';
import {
  RegisterDataProductInConfluence, RegisterDataProductInConfluenceProps
} from '../../../../cdk/lib/register-data-product-in-confluence/register-data-product-in-confluence';

const basicStackId = 'RegisterDataProductInConfluence';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const dynamoTableMock: any = jest.fn();
const mockedStack: any = jest.fn();
const stackBaseProps: RegisterDataProductInConfluenceProps = {
  deploymentEnvironment,
  stackBaseName
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/register-data-product-in-confluence/dynamodb-table', () => ({
  DataProductCatalogTable: jest.fn(() => ({ dynamoTable: dynamoTableMock })) }));

describe('# RegisterDataProductInConfluence', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new RegisterDataProductInConfluence(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a DataProductCatalogTable construct', (done) => {
    const constructId = 'DataProductCatalogTable';
    const construct = new RegisterDataProductInConfluence(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(DataProductCatalogTable).toHaveBeenCalledTimes(1);
    expect(DataProductCatalogTable).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });
});
