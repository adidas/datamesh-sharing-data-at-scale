import { S3, STS } from 'aws-sdk';
import { Logger, AwsSts } from '@adidas-data-mesh/common';
import { Domain } from './domain';
import { HandlerInput, Handler } from './handler';
import { AwsS3 } from './data/aws-s3';

type LambdaEnvironment = {
  LOGGER_LEVEL?: string;
};

const {
  LOGGER_LEVEL
} = process.env as LambdaEnvironment;

const logger = Logger.withLevel(LOGGER_LEVEL ? LOGGER_LEVEL : 'info');
const sts = new STS();
const awsSts = new AwsSts(sts, logger);
const s3 = new S3();
const awsS3 = new AwsS3(s3, logger);
const domain = new Domain({
  awsS3,
  awsSts,
  logger
});
const handler = new Handler(domain, logger);

export const updateS3BucketPolicyHandler =
  async (input: HandlerInput): Promise<void> => handler.execute(input);
