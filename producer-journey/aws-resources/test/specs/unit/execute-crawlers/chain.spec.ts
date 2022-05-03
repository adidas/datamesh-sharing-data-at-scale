import { Construct, Duration } from '@aws-cdk/core';
import { Chain, Choice, Condition, JsonPath, Wait, WaitTime } from '@aws-cdk/aws-stepfunctions';
import { CallAwsService } from '@aws-cdk/aws-stepfunctions-tasks';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  ExecuteCrawlerChain, ExecuteCrawlerChainProps
} from '../../../../cdk/lib/execute-crawlers/chain';

const basicStackId = 'ExecuteCrawlerChain';
const successChain: any = jest.fn();
const stackBaseProps: ExecuteCrawlerChainProps = {
  parallelFlowType: 'Iam',
  successChain
};
const mockedStack: any = jest.fn();
const secondNextMock = jest.fn();
const firstNextMock = jest.fn(() => ({ next: secondNextMock }));
const choiceOtherwiseMock = jest.fn();
const choiceWhenMock = jest.fn(() => ({ otherwise: choiceOtherwiseMock }));
const waitNextMock = jest.fn();

jest.mock('@aws-cdk/core', () => ({
  ...jest.requireActual('@aws-cdk/core'),
  Construct: jest.fn()
}));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  ...jest.requireActual('@aws-cdk/aws-stepfunctions'),
  Chain: { start: jest.fn(() => ({ next: firstNextMock })) }, Wait: jest.fn(() => ({ next: waitNextMock })),
  Choice: jest.fn(() => ({ when: choiceWhenMock })), Condition: { not: jest.fn(), stringEquals: jest.fn() },
  JsonPath: { stringAt: jest.fn() }
}));
jest.mock('@aws-cdk/aws-stepfunctions-tasks', () => ({
  CallAwsService: jest.fn()
}));

describe('# ExecuteCrawlerChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new CheckCrawlerState step successfully', (done) => {
    const constructId = `Check ${ stackBaseProps.parallelFlowType } Crawler`;
    const construct = new ExecuteCrawlerChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(JsonPath.stringAt).toHaveBeenCalledTimes(2);
    expect(JsonPath.stringAt).toHaveBeenNthCalledWith(1, '$.glueDatabaseName');
    expect(CallAwsService).toHaveBeenCalledTimes(2);
    expect(CallAwsService).toHaveBeenNthCalledWith(1, construct, constructId, {
      inputPath: '$',
      resultPath: '$.crawlerInfo',
      resultSelector: {
        'crawlerStatus.$': '$.Crawler.State'
      },
      service: 'glue',
      action: 'getCrawler',
      parameters: {
        Name: getMockObject(JsonPath.stringAt).mock.results[0].value
      },
      iamResources: [ '*' ]
    });

    done();
  });

  it('Should create a new ExecuteCrawler step successfully', (done) => {
    const constructId = `Execute ${ stackBaseProps.parallelFlowType } Crawler`;
    const construct = new ExecuteCrawlerChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(JsonPath.stringAt).toHaveBeenCalledTimes(2);
    expect(JsonPath.stringAt).toHaveBeenNthCalledWith(2, '$.glueDatabaseName');
    expect(CallAwsService).toHaveBeenCalledTimes(2);
    expect(CallAwsService).toHaveBeenNthCalledWith(2, construct, constructId, {
      inputPath: '$',
      resultPath: JsonPath.DISCARD,
      service: 'glue',
      action: 'startCrawler',
      parameters: {
        Name: getMockObject(JsonPath.stringAt).mock.results[1].value
      },
      iamResources: [ '*' ]
    });

    done();
  });

  it('Should create a new WaitForReadyState step successfully', (done) => {
    const constructId = `Wait ${ stackBaseProps.parallelFlowType } Craweler for 1 minute`;
    const minutesDuration = 1;
    const construct = new ExecuteCrawlerChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Wait).toHaveBeenCalledTimes(1);
    expect(Wait).toHaveBeenCalledWith(construct, constructId, {
      comment: 'Wait 1 minutes', time: WaitTime.duration(Duration.minutes(minutesDuration))
    });
    expect(waitNextMock).toHaveBeenCalledTimes(1);
    expect(waitNextMock).toHaveBeenCalledWith(getMockObject(CallAwsService).mock.instances[1]);

    done();
  });

  it('Should create a new Choice step successfully', (done) => {
    const constructId = `Is ${ stackBaseProps.parallelFlowType } Crawler Ready`;
    const construct = new ExecuteCrawlerChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Choice).toHaveBeenCalledTimes(1);
    expect(Choice).toHaveBeenCalledWith(construct, constructId, {
      comment: 'Is Crawler Ready?'
    });

    // Should check if crawler status is ready
    expect(Condition.stringEquals).toHaveBeenCalledTimes(1);
    expect(Condition.stringEquals).toHaveBeenCalledWith('$.crawlerInfo.crawlerStatus', 'READY');
    expect(Condition.not).toHaveBeenCalledTimes(1);
    expect(Condition.not).toHaveBeenCalledWith(getMockObject(Condition.stringEquals).mock.results[0].value);
    expect(choiceWhenMock).toHaveBeenCalledTimes(1);
    expect(choiceWhenMock).toHaveBeenCalledWith(
      getMockObject(Condition.not).mock.results[0].value,
      getMockObject(waitNextMock).mock.results[0].value
    );
    expect(choiceOtherwiseMock).toHaveBeenCalledTimes(1);
    expect(choiceOtherwiseMock).toHaveBeenCalledWith(successChain);

    done();
  });

  it('Should create a new ExecuteCrawlerChain successfully', (done) => {
    new ExecuteCrawlerChain(
      mockedStack, basicStackId, stackBaseProps
    );

    // Should start with execute crawler step
    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(getMockObject(CallAwsService).mock.instances[0]);

    // Should continue with check crawler step
    expect(firstNextMock).toHaveBeenCalledTimes(1);
    expect(firstNextMock).toHaveBeenCalledWith(getMockObject(CallAwsService).mock.instances[1]);

    // Should finish with choice step
    expect(secondNextMock).toHaveBeenCalledTimes(1);
    expect(secondNextMock).toHaveBeenCalledWith(getMockObject(choiceOtherwiseMock).mock.results[0].value);

    done();
  });
});
