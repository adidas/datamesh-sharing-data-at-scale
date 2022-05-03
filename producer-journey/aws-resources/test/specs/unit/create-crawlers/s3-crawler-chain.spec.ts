import { Construct } from '@aws-cdk/core';
import { Chain, JsonPath } from '@aws-cdk/aws-stepfunctions';
import { CallAwsService } from '@aws-cdk/aws-stepfunctions-tasks';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  CreateS3CrawlerChain, CreateS3CrawlerChainProps
} from '../../../../cdk/lib/create-crawlers/s3-crawler-chain';

const lambdaInvokeId = 'Create Iam Crawler: S3 Target';
const basicStackId = 'CreateS3CrawlerChain';
const lakeFormationAdminRoleName = 'data-lake-administrator-dev';
const successChain: any = jest.fn();
const deploymentEnvironment = 'dev';
const stackBaseProps: CreateS3CrawlerChainProps = {
  deploymentEnvironment,
  parallelFlowType: 'Iam',
  successChain
};
const mockedStack: any = jest.fn();
const nextMock = jest.fn();

jest.mock('@aws-cdk/core', () => ({
  Construct: jest.fn(), Stack: { of: jest.fn(() => ({ account: 'accountId' })) }
}));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  JsonPath: { DISCARD: 'JsonPathDISCARD', stringAt: jest.fn() },
  Chain: { start: jest.fn(() => ({ next: nextMock })) }
}));
jest.mock('@aws-cdk/aws-stepfunctions-tasks', () => ({ CallAwsService: jest.fn() }));

describe('# CreateS3CrawlerChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new CreateS3CrawlerChain lambda invoke successfully', (done) => {
    const construct = new CreateS3CrawlerChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(JsonPath.stringAt).toHaveBeenCalledTimes(3);
    expect(JsonPath.stringAt).toHaveBeenNthCalledWith(1, '$.bucketS3Uri');
    expect(JsonPath.stringAt).toHaveBeenNthCalledWith(2, '$.glueDatabaseName');
    expect(JsonPath.stringAt).toHaveBeenNthCalledWith(3, '$.glueDatabaseName');
    expect(CallAwsService).toHaveBeenCalledTimes(1);
    expect(CallAwsService).toHaveBeenCalledWith(construct, lambdaInvokeId, {
      resultPath: 'JsonPathDISCARD',
      service: 'glue',
      action: 'createCrawler',
      parameters: {
        Targets: {
          S3Targets: [
            {
              Path: getMockObject(JsonPath.stringAt).mock.results[0].value
            }
          ]
        },
        Schedule: 'cron(0 20 * * ? *)',
        Configuration: '{"Version":1,"Grouping":{"TableLevelConfiguration":2}}',
        DatabaseName: getMockObject(JsonPath.stringAt).mock.results[1].value,
        Name: getMockObject(JsonPath.stringAt).mock.results[2].value,
        SchemaChangePolicy: {
          DeleteBehavior: 'DEPRECATE_IN_DATABASE',
          UpdateBehavior: 'UPDATE_IN_DATABASE'
        },
        Role: `arn:aws:iam::accountId:role/${ lakeFormationAdminRoleName }`
      },
      iamResources: [ '*' ]
    });

    done();
  });

  it('Should create a new CreateS3CrawlerChain successfully', (done) => {
    new CreateS3CrawlerChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(getMockObject(CallAwsService).mock.instances[0]);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(nextMock).toHaveBeenCalledWith(successChain);

    done();
  });
});
