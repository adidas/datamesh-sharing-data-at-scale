import { readdirSync } from 'fs';
import { Tags } from '@aws-cdk/core';
import buildStack from '../../../../cdk/bin/cdk-app';
import { CatalogueAssetsMainStack } from '../../../../cdk/lib/catalogue-assets-main-stack';
import { DataProductAssetsMainStack } from '../../../../cdk/lib/data-product-assets-setup-main-stack';
import { LakeFormationEnablementJourneys } from '../../../../cdk/lib/lakeformation-enablement-journeys';

const region = 'eu-west-1';
const stackCatalogBaseName = 'adidas-Catalogue';
const stackJourneysBaseName = 'adidas-Enablement-Journeys';
const deploymentEnvironment = 'dev';
const catalogueRootPath = './data-products-catalogue/dev';
const dataProductPath = 'foo-bar';
const dataProductAssetsCRLambdaMock = {
  customResourceLambda: 'customResourceLambda'
};
const dataProductCatalogueS3Mock = {
  dataProductCatalogueBucket: 'dataProductCatalogueBucket'
};
const dataProductCatalogueEventMock = {
  eventBus: 'eventBus'
};
let tryGetContextMock = jest.fn().mockImplementation((envKey: string) => {
  switch (envKey) {
  case 'region': return region;
  case 'deploymentEnvironment': return deploymentEnvironment;
  default: return '';
  }
});
const stackEnv = {
  region,
  account: 'CDK_DEFAULT_ACCOUNT'
};
// eslint-disable-next-line @typescript-eslint/naming-convention
const App = jest.fn(() => ({ node: { tryGetContext: tryGetContextMock } }));
const addTagsMock = jest.fn();

jest.mock('fs', () => ({ readdirSync: jest.fn(() => [ 'foo-bar' ]) }));
jest.mock('@aws-cdk/core', () => ({ Tags: { of: jest.fn(() => ({ add: addTagsMock })) } }));
jest.mock('../../../../cdk/lib/catalogue-assets-main-stack', () => ({ CatalogueAssetsMainStack: jest.fn(() => ({
  dataProductAssetsCRLambda: dataProductAssetsCRLambdaMock,
  dataProductCatalogueS3: dataProductCatalogueS3Mock,
  dataProductCatalogueEvent: dataProductCatalogueEventMock
})) }));
jest.mock('../../../../cdk/lib/data-product-assets-setup-main-stack', () => ({
  DataProductAssetsMainStack: jest.fn() }));
jest.mock('../../../../cdk/lib/lakeformation-enablement-journeys', () => ({
  LakeFormationEnablementJourneys: jest.fn() }));
jest.mock('../../../../cdk/lib/lakeformation-config-stack.ts', () => ({
  LakeformationConfigStack: jest.fn() }));

describe('# Cdk App Build Stack', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should be able to setup the CDK context', (done) => {
    const app: any = new App();

    buildStack(app);

    expect(tryGetContextMock).toHaveBeenCalledTimes(2);
    expect(tryGetContextMock).toHaveBeenNthCalledWith(1, 'region');
    expect(tryGetContextMock).toHaveBeenNthCalledWith(2, 'deploymentEnvironment');
    expect(readdirSync).toHaveBeenCalledTimes(1);
    expect(readdirSync).toHaveBeenCalledWith(catalogueRootPath);

    done();
  });

  it('Should build CatalogueAssetsMainStack stack successfully', (done) => {
    const app: any = new App();
    const deployName = `${ stackCatalogBaseName }-${ deploymentEnvironment }`;

    buildStack(app);

    expect(CatalogueAssetsMainStack).toHaveBeenCalledTimes(1);
    expect(CatalogueAssetsMainStack).toHaveBeenCalledWith(app, deployName, {
      env: stackEnv,
      stackBaseName: stackCatalogBaseName,
      deploymentEnvironment
    });

    done();
  });

  it('Should build LakeFormationEnablementJourneys stack successfully', (done) => {
    const app: any = new App();
    const deployName = `${ stackJourneysBaseName }-${ deploymentEnvironment }`;

    buildStack(app);

    expect(LakeFormationEnablementJourneys).toHaveBeenCalledTimes(1);
    expect(LakeFormationEnablementJourneys).toHaveBeenCalledWith(app, deployName, {
      env: stackEnv,
      stackBaseName: stackJourneysBaseName,
      deploymentEnvironment,
      dataProductCatalogueBucket: 'dataProductCatalogueBucket',
      orchestratorEventBus: 'eventBus'
    });

    done();
  });

  it('Should build DataProductAssetsMainStack stacks successfully', (done) => {
    const app: any = new App();
    const DATA_PRODUCT_BASE_NAME = `${ stackCatalogBaseName }-${ dataProductPath }`;
    const constructId = `${ DATA_PRODUCT_BASE_NAME }-${ deploymentEnvironment }`;

    buildStack(app);

    expect(DataProductAssetsMainStack).toHaveBeenCalledTimes(1);
    expect(DataProductAssetsMainStack).toHaveBeenCalledWith(app, constructId, {
      env: stackEnv,
      stackBaseName: DATA_PRODUCT_BASE_NAME,
      deploymentEnvironment,
      dataProductNameObjectKey: dataProductPath,
      dataProductCataloguePath: `${ catalogueRootPath }/${ dataProductPath }`,
      customResourceLambda: 'customResourceLambda'
    });

    done();
  });

  it('Should add tags to the stacks successfully', (done) => {
    const app: any = new App();

    buildStack(app);

    expect(Tags.of).toHaveBeenCalledTimes(13);
    expect(addTagsMock).toHaveBeenCalledTimes(13);
    expect(addTagsMock).toHaveBeenNthCalledWith(1, 'data-product', dataProductPath);
    expect(addTagsMock).toHaveBeenNthCalledWith(2, 'app', 'adidas data mesh');
    expect(addTagsMock).toHaveBeenNthCalledWith(3, 'project-key', 'adidas');
    expect(addTagsMock).toHaveBeenNthCalledWith(4, 'deployment-environment', deploymentEnvironment);
    expect(addTagsMock).toHaveBeenNthCalledWith(5, 'app', 'adidas data mesh');
    expect(addTagsMock).toHaveBeenNthCalledWith(6, 'project-key', 'adidas');
    expect(addTagsMock).toHaveBeenNthCalledWith(7, 'deployment-environment', deploymentEnvironment);
    expect(addTagsMock).toHaveBeenNthCalledWith(8, 'app', 'adidas data mesh');
    expect(addTagsMock).toHaveBeenNthCalledWith(9, 'project-key', 'adidas');
    expect(addTagsMock).toHaveBeenNthCalledWith(10, 'deployment-environment', deploymentEnvironment);
    expect(addTagsMock).toHaveBeenNthCalledWith(11, 'app', 'adidas data mesh');
    expect(addTagsMock).toHaveBeenNthCalledWith(12, 'project-key', 'adidas');
    expect(addTagsMock).toHaveBeenNthCalledWith(13, 'deployment-environment', deploymentEnvironment);

    done();
  });

  it('Should attach branch tag if feature branch successfully', (done) => {
    const deploymentEnvironmentFeature = 'adidas-123';
    const branchName = `${ deploymentEnvironmentFeature }/branch`;

    tryGetContextMock = jest.fn().mockImplementation((envKey) => {
      switch (envKey) {
      case 'region': return region;
      case 'deploymentEnvironment': return deploymentEnvironmentFeature;
      case 'branch': return branchName;
      default: return '';
      }
    });
    const app: any = new App();

    buildStack(app);

    expect(tryGetContextMock).toHaveBeenCalledTimes(6);
    expect(tryGetContextMock).toHaveBeenNthCalledWith(1, 'region');
    expect(tryGetContextMock).toHaveBeenNthCalledWith(2, 'deploymentEnvironment');
    expect(tryGetContextMock).toHaveBeenNthCalledWith(3, 'branch');
    expect(tryGetContextMock).toHaveBeenNthCalledWith(4, 'branch');
    expect(tryGetContextMock).toHaveBeenNthCalledWith(5, 'branch');
    expect(tryGetContextMock).toHaveBeenNthCalledWith(6, 'branch');
    expect(Tags.of).toHaveBeenCalledTimes(17);
    expect(addTagsMock).toHaveBeenCalledTimes(17);
    expect(addTagsMock).toHaveBeenNthCalledWith(1, 'data-product', dataProductPath);
    expect(addTagsMock).toHaveBeenNthCalledWith(2, 'app', 'adidas data mesh');
    expect(addTagsMock).toHaveBeenNthCalledWith(3, 'project-key', 'adidas');
    expect(addTagsMock).toHaveBeenNthCalledWith(4, 'deployment-environment', deploymentEnvironmentFeature);
    expect(addTagsMock).toHaveBeenNthCalledWith(5, 'branch', branchName);
    expect(addTagsMock).toHaveBeenNthCalledWith(6, 'app', 'adidas data mesh');
    expect(addTagsMock).toHaveBeenNthCalledWith(7, 'project-key', 'adidas');
    expect(addTagsMock).toHaveBeenNthCalledWith(8, 'deployment-environment', deploymentEnvironmentFeature);
    expect(addTagsMock).toHaveBeenNthCalledWith(9, 'branch', branchName);
    expect(addTagsMock).toHaveBeenNthCalledWith(10, 'app', 'adidas data mesh');
    expect(addTagsMock).toHaveBeenNthCalledWith(11, 'project-key', 'adidas');
    expect(addTagsMock).toHaveBeenNthCalledWith(12, 'deployment-environment', deploymentEnvironmentFeature);
    expect(addTagsMock).toHaveBeenNthCalledWith(13, 'branch', branchName);
    expect(addTagsMock).toHaveBeenNthCalledWith(14, 'app', 'adidas data mesh');
    expect(addTagsMock).toHaveBeenNthCalledWith(15, 'project-key', 'adidas');
    expect(addTagsMock).toHaveBeenNthCalledWith(16, 'deployment-environment', deploymentEnvironmentFeature);
    expect(addTagsMock).toHaveBeenNthCalledWith(17, 'branch', branchName);

    done();
  });
});
