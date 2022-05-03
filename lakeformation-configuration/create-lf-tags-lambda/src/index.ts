import { LakeFormation, STS } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';
import { CloudFormationCustomResourceHandler } from 'aws-lambda';
import { Domain } from './domain';
import { Handler } from './handler';
import { AwsSts } from './data/aws-sts';
import { AwsLakeFormation } from './data/aws-lake-formation';

type LambdaEnvironment = {
  LOGGER_LEVEL?: string;
  DATA_LAKE_ADMIN_ROLE_SESSION_NAME: string;
  ACCOUNT_ID: string;
};

const { LOGGER_LEVEL, DATA_LAKE_ADMIN_ROLE_SESSION_NAME, ACCOUNT_ID } = process.env as LambdaEnvironment;

const logger = Logger.withLevel(LOGGER_LEVEL ? LOGGER_LEVEL : 'info');
const lakeFormation = new LakeFormation();
const sts = new STS();
const awsSts = new AwsSts(sts, DATA_LAKE_ADMIN_ROLE_SESSION_NAME, ACCOUNT_ID, logger);
const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
const domain = new Domain({
  awsLakeFormation, awsSts, logger
});
const handler = new Handler(domain, logger);

export const createLfTagsHandler: CloudFormationCustomResourceHandler =
  async (input, context): Promise<void> => handler.execute(input, context);
