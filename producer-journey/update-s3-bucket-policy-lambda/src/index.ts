import { S3, STS } from 'aws-sdk';
import { Logger, AwsSts } from '@adidas-data-mesh/common';
import { Domain } from './domain';
import { DataProductProducerInfoObject, Handler } from './handler';
import { AwsS3 } from './data/aws-s3';

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
const s3 = new S3();
const awsS3 = new AwsS3(s3, logger);
const domain = new Domain({
  awsS3,
  awsSts,
  lakeFormationAdminRoleName: DATA_LAKE_ADMIN_ROLE_SESSION_NAME,
  centralAccount: ACCOUNT_ID,
  logger
});
const handler = new Handler(domain, logger);

export const updateS3BucketPolicyHandler =
  async (input: DataProductProducerInfoObject): Promise<void> => handler.execute(input);
