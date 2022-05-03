import { Logger } from '@adidas-data-mesh/common';
import { AwsGlue } from './data/aws-glue';

type DomainConfig = {
  readonly awsGlue: AwsGlue;
  readonly logger: Logger;
};

export class Domain {
  private readonly awsGlue: AwsGlue;
  private readonly logger: Logger;
  private readonly loggingTag = 'Domain';
  private readonly lakeformationSIDPolicyName = 'AllowFullCatalogAccess';

  public constructor({ awsGlue, logger }: DomainConfig) {
    this.awsGlue = awsGlue;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(producerAccountId: string): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', producerAccountId);

      const currentGlueCatalogPolicy = await this.awsGlue.getGlueCatalogPolicy();

      this.logger.debug('Current Glue Catalog Policy', currentGlueCatalogPolicy);

      const glueCatalogStatement = currentGlueCatalogPolicy.Statement.find(({ Sid }) =>
        Sid === this.lakeformationSIDPolicyName);
      const newPrincipalAccount = this.buildAWSPrincipal(producerAccountId);
      const awsPrincipal = glueCatalogStatement?.Principal.AWS ?? '';
      const setAccountsArn = new Set(
        Array.isArray(awsPrincipal) ? awsPrincipal : [ awsPrincipal ]
      ).add(newPrincipalAccount);
      const accountsArn = [ ...setAccountsArn ];
      const newGlueCatalogStatement = {
        ...glueCatalogStatement,
        Principal: {
          AWS: accountsArn
        }
      };

      this.logger.debug('New Glue Catalog Statement', newGlueCatalogStatement);

      const newGlueCatalogPolicy = {
        ...currentGlueCatalogPolicy,
        Statement: currentGlueCatalogPolicy.Statement.map((glueStatement) =>
          glueStatement.Sid === this.lakeformationSIDPolicyName ? newGlueCatalogStatement : glueStatement)
      };

      this.logger.debug('New Glue Catalog Policy', newGlueCatalogPolicy);

      await this.awsGlue.setGluePolicy(newGlueCatalogPolicy);

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  private buildAWSPrincipal(accountId: string) {
    return `arn:aws:iam::${ accountId }:root`;
  }
}
