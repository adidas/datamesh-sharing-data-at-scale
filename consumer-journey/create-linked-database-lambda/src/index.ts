import { Glue, STS } from 'aws-sdk';
import { Logger, AwsSts } from '@adidas-data-mesh/common';
import { Domain } from './domain';
import { DataProductConsumer, Handler } from './handler';
import { AwsGlue } from './data/aws-glue';

type LambdaEnvironment = {
  LOGGER_LEVEL?: string;
  ACCOUNT_ID: string;
};

const {
  LOGGER_LEVEL, ACCOUNT_ID
} = process.env as LambdaEnvironment;

const logger = Logger.withLevel(LOGGER_LEVEL ? LOGGER_LEVEL : 'info');
const sts = new STS();
const awsSts = new AwsSts(sts, logger);
const glue = new Glue();
const awsGlue = new AwsGlue(glue, ACCOUNT_ID, logger);
const domain = new Domain({
  awsSts, awsGlue, logger
});
const handler = new Handler(domain, logger);

export const createLinkedDatabaseHandler =
  async (input: DataProductConsumer): Promise<void> => handler.execute(input);
