import { Glue, LakeFormation, STS } from 'aws-sdk';
import { Logger, AwsSts } from '@adidas-data-mesh/common';
import { Domain } from './domain';
import { Handler } from './handler';
import { AwsGlue } from './data/aws-glue';
import { AwsLakeFormation } from './data/aws-lake-formation';

type LambdaEnvironment = {
  LOGGER_LEVEL?: string;
  DATA_LAKE_ADMIN_ROLE_SESSION_NAME: string;
  ACCOUNT_ID: string;
};

const {
  LOGGER_LEVEL, DATA_LAKE_ADMIN_ROLE_SESSION_NAME, ACCOUNT_ID
} = process.env as LambdaEnvironment;

const logger = Logger.withLevel(LOGGER_LEVEL ? LOGGER_LEVEL : 'info');
const sts = new STS();
const awsSts = new AwsSts(sts, logger);
const glue = new Glue();
const awsGlue = new AwsGlue(glue, logger);
const lakeFormation = new LakeFormation();
const awsLakeFormation = new AwsLakeFormation(lakeFormation, logger);
const domain = new Domain({
  awsSts, awsLakeFormation, awsGlue, logger,
  lakeRoleSessionName: DATA_LAKE_ADMIN_ROLE_SESSION_NAME, accountId: ACCOUNT_ID
});
const handler = new Handler(domain, logger);

export const createGlueDatabaseHandler =
  async (input: string): Promise<void> => handler.execute(input);
