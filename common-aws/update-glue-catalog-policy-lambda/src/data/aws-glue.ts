import { AWSError, Glue } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';
import { GluePolicy, GluePolicyEffect } from '../glue-policy.model';

export class AwsGlue {
  private readonly glue: Glue;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsGlue';
  private readonly accountId: string;
  private readonly region: string;
  private readonly lakeformationSIDPolicyName = 'AllowFullCatalogAccess';

  public constructor(glue: Glue, accountId: string, region: string, logger: Logger) {
    this.glue = glue;
    this.accountId = accountId;
    this.region = region;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async getGlueCatalogPolicy(): Promise<GluePolicy> {
    try {
      this.logger.info('Starting');

      const result = await this.glue.getResourcePolicy().promise();

      if (!result.PolicyInJson) {
        const errorMessage = 'No policy has been found';

        this.logger.info(errorMessage);

        throw new Error(errorMessage);
      }

      const gluePolicy = JSON.parse(result.PolicyInJson) as GluePolicy;

      this.logger.debug('Current Glue Policy', gluePolicy);

      const glueCatalogPolicy = gluePolicy.Statement.some(({ Sid }) => Sid === this.lakeformationSIDPolicyName)
        ? gluePolicy : {
          ...gluePolicy,
          Statement: [
            ...gluePolicy.Statement,
            this.buildDefaultGlueCatalogStatement()
          ]
        };

      this.logger.info('Finishing...', glueCatalogPolicy);

      return glueCatalogPolicy;
    } catch (error) {
      this.logger.error(error);
      const noPolicyFound = 'EntityNotFoundException';

      if ((error as AWSError).code === noPolicyFound) {
        // eslint-disable-next-line no-undefined
        return this.buildDefaultGluePolicy();
      }

      throw error;
    }
  }

  public async setGluePolicy(gluePolicy: GluePolicy): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('SetGluePolicy Input', gluePolicy);

      await this.glue.putResourcePolicy({
        PolicyInJson: JSON.stringify(gluePolicy),
        EnableHybrid: 'TRUE'
      }).promise();

      this.logger.info('Finishing...');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  private buildDefaultGluePolicy(): GluePolicy {
    return {
      Version: '2012-10-17',
      Statement: [ this.buildDefaultGlueCatalogStatement() ]
    };
  }

  private buildDefaultGlueCatalogStatement() {
    return {
      Sid: this.lakeformationSIDPolicyName,
      Effect: GluePolicyEffect.allow,
      Action: 'glue:*',
      Resource: [
        `arn:aws:glue:${ this.region }:${ this.accountId }:catalog`,
        `arn:aws:glue:${ this.region }:${ this.accountId }:database/*`,
        `arn:aws:glue:${ this.region }:${ this.accountId }:table/*/*`
      ],
      Principal: {
        AWS: [ ]
      }
    };
  }
}
