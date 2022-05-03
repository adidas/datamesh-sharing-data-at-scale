import { Glue } from 'aws-sdk';
import { SQSEvent } from 'aws-lambda';
import { Logger } from '@adidas-data-mesh/common';
import { Domain } from './domain';
import { Handler } from './handler';
import { AwsGlue } from './data/aws-glue';

type LambdaEnvironment = {
  LOGGER_LEVEL?: string;
  REGION: string;
  ACCOUNT_ID: string;
};

const {
  LOGGER_LEVEL, REGION, ACCOUNT_ID
} = process.env as LambdaEnvironment;

const logger = Logger.withLevel(LOGGER_LEVEL ? LOGGER_LEVEL : 'info');
const glue = new Glue();
const awsGlue = new AwsGlue(glue, ACCOUNT_ID, REGION, logger);
const domain = new Domain({
  awsGlue, logger
});
const handler = new Handler(domain, logger);

export const updateGlueCatalogPolicyHandler =
  async (input: SQSEvent): Promise<void> => handler.execute(input);
