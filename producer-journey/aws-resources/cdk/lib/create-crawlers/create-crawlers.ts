import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { CreateS3CrawlerChain } from './s3-crawler-chain';

export type CreateCrawlersProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class CreateCrawlers extends Construct {
  /* AWS resources attached to this construct */
  private readonly deploymentEnvironment: DeploymentEnvironment;

  public constructor(scope: Construct, id: string, { deploymentEnvironment }: CreateCrawlersProps) {
    super(scope, id);

    this.deploymentEnvironment = deploymentEnvironment;
  }

  public setupS3LFChain(successChain: Chain): CreateS3CrawlerChain {
    const newChain = new CreateS3CrawlerChain(this, 'CreateS3LFCrawlerChain', {
      parallelFlowType: 'LF',
      deploymentEnvironment: this.deploymentEnvironment,
      successChain
    });

    return newChain;
  }

  public setupS3IamChain(successChain: Chain): CreateS3CrawlerChain {
    const newChain = new CreateS3CrawlerChain(this, 'CreateS3IamCrawlerChain', {
      parallelFlowType: 'Iam',
      deploymentEnvironment: this.deploymentEnvironment,
      successChain
    });

    return newChain;
  }
}
