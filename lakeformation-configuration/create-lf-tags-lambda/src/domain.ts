import { Logger } from '@adidas-data-mesh/common';
import {
  CloudFormationCustomResourceCreateEvent, CloudFormationCustomResourceDeleteEvent,
  CloudFormationCustomResourceUpdateEvent
} from 'aws-lambda';
import { AwsSts } from './data/aws-sts';
import { AwsLakeFormation, LakeFormationTag } from './data/aws-lake-formation';

type DomainConfig = {
  readonly awsSts: AwsSts;
  readonly awsLakeFormation: AwsLakeFormation;
  readonly logger: Logger;
};

export class Domain {
  private readonly awsSts: AwsSts;
  private readonly awsLakeFormation: AwsLakeFormation;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';

  public constructor({ awsLakeFormation, awsSts, logger }: DomainConfig) {
    this.awsLakeFormation = awsLakeFormation;
    this.awsSts = awsSts;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async deleteLFTag({
    PhysicalResourceId
  }: CloudFormationCustomResourceDeleteEvent): Promise<string> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', PhysicalResourceId);

      const newCredentials = await this.awsSts.getRoleCredentials();

      this.awsLakeFormation.withNewCredentials(newCredentials);

      await this.awsLakeFormation.deleteLFTag(PhysicalResourceId);

      this.logger.info('Finishing');

      return PhysicalResourceId;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async createLFTag({
    ResourceProperties
  }: CloudFormationCustomResourceCreateEvent): Promise<string> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', ResourceProperties);
      const tag = ResourceProperties.Tag as LakeFormationTag;

      const newCredentials = await this.awsSts.getRoleCredentials();

      this.awsLakeFormation.withNewCredentials(newCredentials);

      await this.awsLakeFormation.createLFTag(tag);

      this.logger.info('Finishing');

      return tag.TagKey;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async updateLFTag({
    ResourceProperties, PhysicalResourceId, OldResourceProperties
  }: CloudFormationCustomResourceUpdateEvent): Promise<string> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', ResourceProperties, PhysicalResourceId, OldResourceProperties);
      const newTag = ResourceProperties.Tag as LakeFormationTag;
      const oldTag = OldResourceProperties.Tag as LakeFormationTag;

      const newCredentials = await this.awsSts.getRoleCredentials();

      this.awsLakeFormation.withNewCredentials(newCredentials);

      await this.awsLakeFormation.updateLFTag(PhysicalResourceId, oldTag.TagValues, newTag.TagValues);

      this.logger.info('Finishing');

      return PhysicalResourceId;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
