import { Construct, Duration } from '@aws-cdk/core';
import { Chain, Choice, Condition, IChainable, JsonPath, Wait, WaitTime } from '@aws-cdk/aws-stepfunctions';
import { CallAwsService } from '@aws-cdk/aws-stepfunctions-tasks';

export type ExecuteCrawlerChainProps = {
  readonly parallelFlowType: 'LF' | 'Iam';
  readonly successChain: Chain;
};

export class ExecuteCrawlerChain extends Construct {
  public readonly chain: Chain;

  public constructor(scope: Construct, id: string, props: ExecuteCrawlerChainProps) {
    super(scope, id);

    this.chain = this.setupChain(props);
  }

  private setupChain(props: ExecuteCrawlerChainProps) {
    const waitForReadyState = this.waitForReadyState(props);
    const checkCrawlerState = this.checkCrawlerState(props);
    const waitAndCheck = waitForReadyState.next(checkCrawlerState);
    const choice = new Choice(this, `Is ${ props.parallelFlowType } Crawler Ready`, {
      comment: 'Is Crawler Ready?'
    });

    return Chain
      .start(this.executeCrawler(props))
      .next(checkCrawlerState)
      .next(choice
        .when(Condition.not(Condition.stringEquals('$.crawlerInfo.crawlerStatus', 'READY')), waitAndCheck)
        .otherwise(props.successChain));
  }

  private executeCrawler({ parallelFlowType }: ExecuteCrawlerChainProps): IChainable {
    return new CallAwsService(this, `Execute ${ parallelFlowType } Crawler`, {
      inputPath: '$',
      resultPath: JsonPath.DISCARD,
      service: 'glue',
      action: 'startCrawler',
      parameters: {
        Name: JsonPath.stringAt('$.glueDatabaseName')
      },
      iamResources: [ '*' ]
    });
  }

  private checkCrawlerState({ parallelFlowType }: ExecuteCrawlerChainProps): IChainable {
    return new CallAwsService(this, `Check ${ parallelFlowType } Crawler`, {
      inputPath: '$',
      resultPath: '$.crawlerInfo',
      resultSelector: {
        'crawlerStatus.$': '$.Crawler.State'
      },
      service: 'glue',
      action: 'getCrawler',
      parameters: {
        Name: JsonPath.stringAt('$.glueDatabaseName')
      },
      iamResources: [ '*' ]
    });
  }

  private waitForReadyState({ parallelFlowType }: ExecuteCrawlerChainProps) {
    const minutesDuration = 1;

    return new Wait(this, `Wait ${ parallelFlowType } Craweler for 1 minute`, {
      comment: 'Wait 1 minutes', time: WaitTime.duration(Duration.minutes(minutesDuration))
    });
  }
}
