import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { CreateS3CrawlerChain } from '../../../../cdk/lib/create-crawlers/s3-crawler-chain';
import {
  CreateCrawlers, CreateCrawlersProps
} from '../../../../cdk/lib/create-crawlers/create-crawlers';

const basicStackId = 'CreateCrawlers';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const stackBaseProps: CreateCrawlersProps = {
  deploymentEnvironment,
  stackBaseName
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/create-crawlers/s3-crawler-chain', () => ({
  CreateS3CrawlerChain: jest.fn() }));

describe('# CreateCrawlers', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new CreateCrawlers(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a CreateS3LFCrawlerChain construct', (done) => {
    const constructId = 'CreateS3LFCrawlerChain';
    const construct = new CreateCrawlers(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupS3LFChain(successChain);

    expect(CreateS3CrawlerChain).toHaveBeenCalledTimes(1);
    expect(CreateS3CrawlerChain).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment, successChain, parallelFlowType: 'LF'
    });
    expect(newChain).toEqual(getMockObject(CreateS3CrawlerChain).mock.instances[0]);

    done();
  });

  it('Should have a CreateS3IamCrawlerChain construct', (done) => {
    const constructId = 'CreateS3IamCrawlerChain';
    const construct = new CreateCrawlers(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupS3IamChain(successChain);

    expect(CreateS3CrawlerChain).toHaveBeenCalledTimes(1);
    expect(CreateS3CrawlerChain).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment, successChain, parallelFlowType: 'Iam'
    });
    expect(newChain).toEqual(getMockObject(CreateS3CrawlerChain).mock.instances[0]);

    done();
  });
});
