import { Construct } from '@aws-cdk/core';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { AwsCommon } from '@adidas-data-mesh/common-aws';
import { StateMachineOrchestrator } from './state-machine-orchestrator/state-machine';
import { GetDataProductS3Files } from './get-data-product-s3-file/get-data-product-s3-file';
import { GrantAccessToConsumer } from './grant-access-to-consumer/grant-access-to-consumer';
import { UpdateGlueCatalogPolicy } from './update-glue-catalog-policy/update-glue-catalog-policy';
import { UpdateS3BucketPolicy } from './update-s3-bucket-policy/update-s3-bucket-policy';
import { CreateLinkedDatabase } from './create-linked-database/create-linked-database';
import { GrantAccessToConsumerRole } from './grant-access-to-consumer-role/grant-access-to-consumer-role';

export type ConsumerJourneyProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
  readonly awsCommon: AwsCommon;
};

export class ConsumerJourney extends Construct {
  /* AWS resources attached to this construct */
  public readonly stateMachineOrchestrator: StateMachineOrchestrator;
  public readonly getDataProductS3Files: GetDataProductS3Files;
  public readonly grantAccessToConsumer: GrantAccessToConsumer;
  public readonly updateGlueCatalogPolicy: UpdateGlueCatalogPolicy;
  public readonly updateS3BucketPolicy: UpdateS3BucketPolicy;
  public readonly createLinkedDatabase: CreateLinkedDatabase;
  public readonly grantAccessToConsumerRole: GrantAccessToConsumerRole;

  public constructor(scope: Construct, id: string, props: ConsumerJourneyProps) {
    super(scope, id);

    const { deploymentEnvironment, stackBaseName, awsCommon } = props;

    this.getDataProductS3Files = new GetDataProductS3Files(this, 'GetDataProductS3Files', {
      getDataProductS3FilesLambda: awsCommon.getDataProductS3Files.lambda
    });
    this.updateGlueCatalogPolicy = new UpdateGlueCatalogPolicy(this, 'UpdateGlueCatalogPolicy', {
      updateGlueCatalogPolicySqs: awsCommon.updateGlueCatalogPolicy.updateGlueCatalogPolicySqs.sqs
    });
    this.grantAccessToConsumer = new GrantAccessToConsumer(this, 'GrantAccessToConsumer', {
      deploymentEnvironment,
      stackBaseName
    });
    this.updateS3BucketPolicy = new UpdateS3BucketPolicy(this, 'UpdateS3BucketPolicyConsumer', {
      deploymentEnvironment,
      stackBaseName
    });
    this.createLinkedDatabase = new CreateLinkedDatabase(this, 'CreateLinkedDatabase', {
      deploymentEnvironment,
      stackBaseName
    });
    this.grantAccessToConsumerRole = new GrantAccessToConsumerRole(this, 'GrantAccessToConsumerRole', {
      deploymentEnvironment,
      stackBaseName
    });

    this.stateMachineOrchestrator = new StateMachineOrchestrator(this, 'StateMachineOrchestrator', {
      deploymentEnvironment,
      stackBaseName,
      getDataProductS3Files: this.getDataProductS3Files,
      grantAccessToConsumer: this.grantAccessToConsumer,
      updateGlueCatalogPolicy: this.updateGlueCatalogPolicy,
      updateS3BucketPolicy: this.updateS3BucketPolicy,
      createLinkedDatabase: this.createLinkedDatabase,
      grantAccessToConsumerRole: this.grantAccessToConsumerRole
    });
  }
}
