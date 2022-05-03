import { Credentials, STS } from 'aws-sdk';
import { Logger } from '../logger';

export class AwsSts {
  private readonly sts: STS;
  private readonly logger: Logger;
  private readonly loggingTag = 'AwsSts';

  public constructor(sts: STS, logger: Logger) {
    this.sts = sts;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async getRoleCredentials(roleNameToAssume: string, accountIdFromRoleToAssume: string): Promise<Credentials> {
    try {
      this.logger.info('Starting');

      const roleArn = `arn:aws:iam::${ accountIdFromRoleToAssume }:role/${ roleNameToAssume }`;

      this.logger.debug('Role to assume: ', roleArn);

      const assumedRole = await this.sts.assumeRole({
        RoleArn: roleArn,
        RoleSessionName: roleNameToAssume
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
