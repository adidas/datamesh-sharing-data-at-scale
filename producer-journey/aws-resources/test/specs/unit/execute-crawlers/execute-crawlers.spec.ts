import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { ExecuteCrawlerChain } from '../../../../cdk/lib/execute-crawlers/chain';
import {
  ExecuteCrawlers
} from '../../../../cdk/lib/execute-crawlers/execute-crawlers';

const basicStackId = 'ExecuteCrawlers';
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/execute-crawlers/chain', () => ({
  ExecuteCrawlerChain: jest.fn() }));

describe('# ExecuteCrawlers', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new ExecuteCrawlers(mockedStack, basicStackId);

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a ExecuteCrawlersChain LF construct', (done) => {
    const constructId = 'ExecuteLFCrawlerChain';
    const construct = new ExecuteCrawlers(mockedStack, basicStackId);

    const newChain = construct.setupLFChain(successChain);

    expect(ExecuteCrawlerChain).toHaveBeenCalledTimes(1);
    expect(ExecuteCrawlerChain).toHaveBeenCalledWith(construct, constructId, {
      parallelFlowType: 'LF', successChain
    });
    expect(newChain).toEqual(getMockObject(ExecuteCrawlerChain).mock.instances[0]);

    done();
  });

  it('Should have a ExecuteCrawlersChain Iam construct', (done) => {
    const constructId = 'ExecuteIamCrawlerChain';
    const construct = new ExecuteCrawlers(mockedStack, basicStackId);

    const newChain = construct.setupIamChain(successChain);

    expect(ExecuteCrawlerChain).toHaveBeenCalledTimes(1);
    expect(ExecuteCrawlerChain).toHaveBeenCalledWith(construct, constructId, {
      parallelFlowType: 'Iam', successChain
    });
    expect(newChain).toEqual(getMockObject(ExecuteCrawlerChain).mock.instances[0]);

    done();
  });
});
