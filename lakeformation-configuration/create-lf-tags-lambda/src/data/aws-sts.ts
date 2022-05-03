import { Credentials, STS } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';

export class AwsSts {
  private readonly sts: STS;
  private readonly lakeRoleSessionName: string;
  private readonly accountId: string;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsSts';

  public constructor(sts: STS, lakeRoleSessionName: string, accountId: string, logger: Logger) {
    this.sts = sts;
    this.lakeRoleSessionName = lakeRoleSessionName;
    this.accountId = accountId;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async getRoleCredentials(): Promise<Credentials> {
    try {
      this.logger.info('Starting');

      const roleArn = `arn:aws:iam::${ this.accountId }:role/${ this.lakeRoleSessionName }`;

      this.logger.debug('Role to assume: ', roleArn);

      const assumedRole = await this.sts.assumeRole({
        RoleArn: roleArn,
        RoleSessionName: this.lakeRoleSessionName
      }).promise();

      this.logger.debug('Role assumed successfully!');

      return new Credentials({
        accessKeyId: assumedRole.Credentials?.AccessKeyId ?? '',
        secretAccessKey: assumedRole.Credentials?.SecretAccessKey ?? '',
        sessionToken: assumedRole.Credentials?.SessionToken
      });
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
