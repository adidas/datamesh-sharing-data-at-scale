import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { ConsumerJourney, ConsumerJourneyProps } from '../../../cdk/lib/consumer-journey.construct';
import { CreateLinkedDatabase } from '../../../cdk/lib/create-linked-database/create-linked-database';
import { GetDataProductS3Files } from '../../../cdk/lib/get-data-product-s3-file/get-data-product-s3-file';
import { GrantAccessToConsumerRole } from '../../../cdk/lib/grant-access-to-consumer-role/grant-access-to-consumer-role';
import { GrantAccessToConsumer } from '../../../cdk/lib/grant-access-to-consumer/grant-access-to-consumer';
import { StateMachineOrchestrator } from '../../../cdk/lib/state-machine-orchestrator/state-machine';
import { UpdateGlueCatalogPolicy } from '../../../cdk/lib/update-glue-catalog-policy/update-glue-catalog-policy';
import { UpdateS3BucketPolicy } from '../../../cdk/lib/update-s3-bucket-policy/update-s3-bucket-policy';

const basicStackId = 'ConsumerJourney';
const deploymentEnvironment = 'dev';
const stackBaseName = 'adidas-Consumer-Journey';
const mockedStack: any = jest.fn();
const awsCommonMock: any = {
  getDataProductS3Files: { lambda: 'getDataProductS3FilesLambda' },
  updateGlueCatalogPolicy: { updateGlueCatalogPolicySqs: { sqs: 'updateGlueCatalogPolicyLambda' } }
};
const stackBaseProps: ConsumerJourneyProps = {
  deploymentEnvironment,
  stackBaseName,
  awsCommon: awsCommonMock
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@adidas-data-mesh/common-aws', () => ({ AwsCommon: jest.fn() }));
jest.mock('../../../cdk/lib/get-data-product-s3-file/get-data-product-s3-file', () => ({
  GetDataProductS3Files: jest.fn()
}));
jest.mock('../../../cdk/lib/update-glue-catalog-policy/update-glue-catalog-policy', () => ({
  UpdateGlueCatalogPolicy: jest.fn()
}));
jest.mock('../../../cdk/lib/grant-access-to-consumer/grant-access-to-consumer', () => ({
  GrantAccessToConsumer: jest.fn()
}));
jest.mock('../../../cdk/lib/update-s3-bucket-policy/update-s3-bucket-policy', () => ({
  UpdateS3BucketPolicy: jest.fn()
}));
jest.mock('../../../cdk/lib/create-linked-database/create-linked-database', () => ({
  CreateLinkedDatabase: jest.fn()
}));
jest.mock('../../../cdk/lib/grant-access-to-consumer-role/grant-access-to-consumer-role', () => ({
  GrantAccessToConsumerRole: jest.fn()
}));
jest.mock('../../../cdk/lib/state-machine-orchestrator/state-machine', () => ({
  StateMachineOrchestrator: jest.fn()
}));

describe('# ConsumerJourney', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new ConsumerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a GetDataProductS3Files construct', (done) => {
    const constructId = 'GetDataProductS3Files';
    const construct = new ConsumerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(GetDataProductS3Files).toHaveBeenCalledTimes(1);
    expect(GetDataProductS3Files).toHaveBeenCalledWith(construct, constructId, {
      getDataProductS3FilesLambda: awsCommonMock.getDataProductS3Files.lambda
    });

    done();
  });

  it('Should have a UpdateGlueCatalogPolicy construct', (done) => {
    const constructId = 'UpdateGlueCatalogPolicy';
    const construct = new ConsumerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(UpdateGlueCatalogPolicy).toHaveBeenCalledTimes(1);
    expect(UpdateGlueCatalogPolicy).toHaveBeenCalledWith(construct, constructId, {
      updateGlueCatalogPolicySqs: awsCommonMock.updateGlueCatalogPolicy.updateGlueCatalogPolicySqs.sqs
    });

    done();
  });

  it('Should have a GrantAccessToConsumer construct', (done) => {
    const constructId = 'GrantAccessToConsumer';
    const construct = new ConsumerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(GrantAccessToConsumer).toHaveBeenCalledTimes(1);
    expect(GrantAccessToConsumer).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a UpdateS3BucketPolicy construct', (done) => {
    const constructId = 'UpdateS3BucketPolicyConsumer';
    const construct = new ConsumerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(UpdateS3BucketPolicy).toHaveBeenCalledTimes(1);
    expect(UpdateS3BucketPolicy).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a CreateLinkedDatabase construct', (done) => {
    const constructId = 'CreateLinkedDatabase';
    const construct = new ConsumerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(CreateLinkedDatabase).toHaveBeenCalledTimes(1);
    expect(CreateLinkedDatabase).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a GrantAccessToConsumerRole construct', (done) => {
    const constructId = 'GrantAccessToConsumerRole';
    const construct = new ConsumerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(GrantAccessToConsumerRole).toHaveBeenCalledTimes(1);
    expect(GrantAccessToConsumerRole).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName
    });

    done();
  });

  it('Should have a StateMachineOrchestrator construct', (done) => {
    const constructId = 'StateMachineOrchestrator';
    const construct = new ConsumerJourney(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(StateMachineOrchestrator).toHaveBeenCalledTimes(1);
    expect(StateMachineOrchestrator).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName: stackBaseProps.stackBaseName,
      getDataProductS3Files: getMockObject(GetDataProductS3Files).mock.instances[0],
      grantAccessToConsumer: getMockObject(GrantAccessToConsumer).mock.instances[0],
      updateGlueCatalogPolicy: getMockObject(UpdateGlueCatalogPolicy).mock.instances[0],
      updateS3BucketPolicy: getMockObject(UpdateS3BucketPolicy).mock.instances[0],
      createLinkedDatabase: getMockObject(CreateLinkedDatabase).mock.instances[0],
      grantAccessToConsumerRole: getMockObject(GrantAccessToConsumerRole).mock.instances[0]
    });

    done();
  });
});
