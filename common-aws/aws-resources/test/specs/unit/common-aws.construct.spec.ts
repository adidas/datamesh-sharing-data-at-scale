import { Construct } from '@aws-cdk/core';
import { AwsCommon, AwsCommonProps } from '../../../cdk/lib/common-aws.construct';
import { GetDataProductS3Files } from '../../../cdk/lib/get-data-product-s3-file/lambda';
import {
  RegisterDataProductInConfluence
} from '../../../cdk/lib/register-data-product-in-confluence/register-data-product-in-confluence';
import { SendOrchestratorEvent } from '../../../cdk/lib/send-orchestrator-event/lambda';
import { UpdateGlueCatalogPolicy } from '../../../cdk/lib/update-glue-catalog-policy/update-glue-catalog-policy';

const basicStackId = 'AwsCommon';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const mockedStack: any = jest.fn();
const dataProductCatalogueBucket: any = { bucketName: 'dataProductCatalogueBucket' };
const orchestratorEventBus: any = { eventBusArn: 'eventBusArn' };
const stackBaseProps: AwsCommonProps = {
  deploymentEnvironment,
  stackBaseName,
  dataProductCatalogueBucket,
  orchestratorEventBus
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../cdk/lib/get-data-product-s3-file/lambda', () => ({
  GetDataProductS3Files: jest.fn() }));
jest.mock('../../../cdk/lib/update-glue-catalog-policy/update-glue-catalog-policy', () => ({
  UpdateGlueCatalogPolicy: jest.fn() }));
jest.mock('../../../cdk/lib/register-data-product-in-confluence/register-data-product-in-confluence', () => ({
  RegisterDataProductInConfluence: jest.fn() }));
jest.mock('../../../cdk/lib/send-orchestrator-event/lambda', () => ({ SendOrchestratorEvent: jest.fn() }));

describe('# AwsCommon', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new AwsCommon(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a GetDataProductS3Files construct', (done) => {
    const constructId = 'GetDataProductS3Files';
    const construct = new AwsCommon(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(GetDataProductS3Files).toHaveBeenCalledTimes(1);
    expect(GetDataProductS3Files).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName,
      dataProductCatalogueBucket
    });

    done();
  });

  it('Should have a UpdateGlueCatalogPolicy construct', (done) => {
    const constructId = 'UpdateGlueCatalogPolicy';
    const construct = new AwsCommon(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(UpdateGlueCatalogPolicy).toHaveBeenCalledTimes(1);
    expect(UpdateGlueCatalogPolicy).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a RegisterDataProductInConfluence construct', (done) => {
    const constructId = 'RegisterDataProductInConfluence';
    const construct = new AwsCommon(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(RegisterDataProductInConfluence).toHaveBeenCalledTimes(1);
    expect(RegisterDataProductInConfluence).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a SendOrchestratorEvent construct', (done) => {
    const constructId = 'SendOrchestratorEvent';
    const construct = new AwsCommon(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(SendOrchestratorEvent).toHaveBeenCalledTimes(1);
    expect(SendOrchestratorEvent).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName,
      orchestratorEventBus
    });

    done();
  });
});
