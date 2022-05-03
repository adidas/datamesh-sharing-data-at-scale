import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { ExecuteCrawlerChain } from './chain';

export class ExecuteCrawlers extends Construct {
  /* AWS resources attached to this construct */

  public constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  public setupLFChain(successChain: Chain): ExecuteCrawlerChain {
    const newChain = new ExecuteCrawlerChain(this, 'ExecuteLFCrawlerChain', {
      parallelFlowType: 'LF',
      successChain
    });

    return newChain;
  }

  public setupIamChain(successChain: Chain): ExecuteCrawlerChain {
    const newChain = new ExecuteCrawlerChain(this, 'ExecuteIamCrawlerChain', {
      parallelFlowType: 'Iam',
      successChain
    });

    return newChain;
  }
}
