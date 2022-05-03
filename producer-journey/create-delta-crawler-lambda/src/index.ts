import { Glue } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';
import { Domain } from './domain';
import { Handler } from './handler';
import { AwsGlue } from './data/aws-glue';

type LambdaEnvironment = {
  LOGGER_LEVEL?: string;
  DATA_LAKE_ADMIN_ROLE_SESSION_NAME: string;
  ACCOUNT_ID: string;
};

const {
  LOGGER_LEVEL, DATA_LAKE_ADMIN_ROLE_SESSION_NAME, ACCOUNT_ID
} = process.env as LambdaEnvironment;

const logger = Logger.withLevel(LOGGER_LEVEL ? LOGGER_LEVEL : 'info');
const glue = new Glue();
const awsGlue = new AwsGlue(glue, logger);
const domain = new Domain({
  awsGlue,
  lakeRoleSessionName: DATA_LAKE_ADMIN_ROLE_SESSION_NAME,
  accountId: ACCOUNT_ID,
  logger
});
const handler = new Handler(domain, logger);

export const createDeltaCrawlerHandler =
  async (input: string): Promise<void> => handler.execute(input);
