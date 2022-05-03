import 'source-map-support/register';
import { readdirSync } from 'fs';
import { App, Environment, Stack, Tags } from '@aws-cdk/core';
import {
  DeploymentEnvironment, DEV_DEPLOYMENT_ENVIRONMENT, PROD_DEPLOYMENT_ENVIRONMENT, getEnvValue
} from '@adidas-data-mesh/common';
import { DataProductAssetsMainStack } from '../lib/data-product-assets-setup-main-stack';
import { CatalogueAssetsMainStack } from '../lib/catalogue-assets-main-stack';
import { LakeFormationEnablementJourneys } from '../lib/lakeformation-enablement-journeys';
import { LakeformationConfigStack } from '../lib/lakeformation-config-stack';

const shouldHaveBranchTag = (deploymentEnvironment: DeploymentEnvironment): boolean =>
  deploymentEnvironment !== PROD_DEPLOYMENT_ENVIRONMENT &&
  deploymentEnvironment !== DEV_DEPLOYMENT_ENVIRONMENT;

const getCatalogueRootPath = (deploymentEnvironment: DeploymentEnvironment): string =>
  deploymentEnvironment === PROD_DEPLOYMENT_ENVIRONMENT
    ? './data-products-catalogue/prod' : './data-products-catalogue/dev';

const buildStack = (app: App): App => {
  const JOURNEYS_BASE_NAME = 'adidas-Enablement-Journeys';
  const CATALOG_BASE_NAME = 'adidas-Catalogue';
  const LAKEFORMATION_CONFIG_BASE_NAME = 'adidas-Lakeformation-Config';
  const region = getEnvValue(app, 'region');
  const deploymentEnvironment: DeploymentEnvironment = getEnvValue(app, 'deploymentEnvironment');

  const stackEnv: Environment = {
    region,
    account: process.env.CDK_DEFAULT_ACCOUNT
  };

  const catalogueRootPath = getCatalogueRootPath(deploymentEnvironment);
  const dataProducts = readdirSync(catalogueRootPath);

  const catalogueAssetsMainStack = new CatalogueAssetsMainStack(
    app, `${ CATALOG_BASE_NAME }-${ deploymentEnvironment }`,
    {
      stackBaseName: CATALOG_BASE_NAME,
      env: stackEnv,
      deploymentEnvironment
    }
  );

  const lakeformationConfigStack = new LakeformationConfigStack(
    app, `${ LAKEFORMATION_CONFIG_BASE_NAME }-${ deploymentEnvironment }`,
    {
      env: stackEnv,
      deploymentEnvironment
    }
  );

  const journeysMainStack = new LakeFormationEnablementJourneys(
    app, `${ JOURNEYS_BASE_NAME }-${ deploymentEnvironment }`,
    {
      env: stackEnv,
      stackBaseName: JOURNEYS_BASE_NAME,
      deploymentEnvironment,
      dataProductCatalogueBucket: catalogueAssetsMainStack.dataProductCatalogueS3.dataProductCatalogueBucket,
      orchestratorEventBus: catalogueAssetsMainStack.dataProductCatalogueEvent.eventBus
    }
  );

  const dataProductAssetsStacks: Array<Stack> = dataProducts.map((dataProductPath) => {
    const DATA_PRODUCT_BASE_NAME = `${ CATALOG_BASE_NAME }-${ dataProductPath }`;
    const deployName = `${ DATA_PRODUCT_BASE_NAME }-${ deploymentEnvironment }`;

    const newStack = new DataProductAssetsMainStack(
      app, deployName,
      {
        env: stackEnv,
        stackBaseName: DATA_PRODUCT_BASE_NAME,
        deploymentEnvironment,
        dataProductNameObjectKey: dataProductPath,
        dataProductCataloguePath: `${ catalogueRootPath }/${ dataProductPath }`,
        customResourceLambda: catalogueAssetsMainStack.dataProductAssetsCRLambda.customResourceLambda
      }
    );

    Tags.of(newStack).add('data-product', dataProductPath);

    return newStack;
  });

  dataProductAssetsStacks.push(catalogueAssetsMainStack);
  dataProductAssetsStacks.push(journeysMainStack);
  dataProductAssetsStacks.push(lakeformationConfigStack);

  dataProductAssetsStacks.forEach((stack) => {
    Tags.of(stack).add('app', 'adidas data mesh');
    Tags.of(stack).add('project-key', 'adidas');
    Tags.of(stack).add('deployment-environment', deploymentEnvironment);

    if (shouldHaveBranchTag(deploymentEnvironment)) {
      Tags.of(stack).add('branch', getEnvValue(app, 'branch'));
    }
  });

  return app;
};

export default buildStack;
