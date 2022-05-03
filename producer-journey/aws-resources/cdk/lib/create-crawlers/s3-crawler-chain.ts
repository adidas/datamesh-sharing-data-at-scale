import { Construct, Stack } from '@aws-cdk/core';
import { Chain, IChainable, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { CallAwsService } from '@aws-cdk/aws-stepfunctions-tasks';
import { DeploymentEnvironment, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';

export type CreateS3CrawlerChainProps = {
  readonly parallelFlowType: 'LF' | 'Iam';
  readonly successChain: Chain;
  readonly deploymentEnvironment: DeploymentEnvironment;
};

export class CreateS3CrawlerChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: CreateS3CrawlerChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: CreateS3CrawlerChainProps) {
    return Chain
      .start(this.createCrawler(props))
      .next(props.successChain);
  }

  private createCrawler({ deploymentEnvironment, parallelFlowType }: CreateS3CrawlerChainProps): IChainable {
    const lakeFormationAdminRoleName = deploymentEnvironment === PROD_DEPLOYMENT_ENVIRONMENT
      ? 'data-lake-administrator-prod' : 'data-lake-administrator-dev';
    const accountId = Stack.of(this).account;

    return new CallAwsService(this, `Create ${ parallelFlowType } Crawler: S3 Target`, {
      resultPath: JsonPath.DISCARD,
      service: 'glue',
      action: 'createCrawler',
      parameters: {
        Targets: {
          S3Targets: [
            {
              Path: JsonPath.stringAt('$.bucketS3Uri')
            }
          ]
        },
        Schedule: 'cron(0 20 * * ? *)',
        Configuration: '{"Version":1,"Grouping":{"TableLevelConfiguration":2}}',
        DatabaseName: JsonPath.stringAt('$.glueDatabaseName'),
        Name: JsonPath.stringAt('$.glueDatabaseName'),
        SchemaChangePolicy: {
          DeleteBehavior: 'DEPRECATE_IN_DATABASE',
          UpdateBehavior: 'UPDATE_IN_DATABASE'
        },
        Role: `arn:aws:iam::${ accountId }:role/${ lakeFormationAdminRoleName }`
      },
      iamResources: [ '*' ]
    });
  }
}
