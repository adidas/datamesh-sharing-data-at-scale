import { LakeFormation, STS } from 'aws-sdk';
import { AwsSts, Logger } from '@adidas-data-mesh/common';
import { Domain } from './domain';
import { Handler, DataProductConsumer } from './handler';
import { AwsLakeFormation } from './data/aws-lake-formation';

type LambdaEnvironment = {
  LOGGER_LEVEL?: string;
};

const {
  LOGGER_LEVEL
} = process.env as LambdaEnvironment;

const logger = Logger.withLevel(LOGGER_LEVEL ? LOGGER_LEVEL : 'info');
const sts = new STS();
const awsSts = new AwsSts(sts, logger);
const lakeFormation = new LakeFormation();
const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
const domain = new Domain({
  awsSts, awsLakeFormation, logger
});
const handler = new Handler(domain, logger);

export const grantAccessToConsumerRoleHandler =
  async (input: DataProductConsumer): Promise<void> => handler.execute(input);
