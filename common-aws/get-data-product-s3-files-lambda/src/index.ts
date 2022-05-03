import { S3 } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';
import { Domain } from './domain';
import { Handler, HandlerOutput } from './handler';
import { AwsS3 } from './data/aws-s3';

type LambdaEnvironment = {
  LOGGER_LEVEL?: string;
  BUCKET_NAME: string;
};

const {
  LOGGER_LEVEL, BUCKET_NAME
} = process.env as LambdaEnvironment;

const logger = Logger.withLevel(LOGGER_LEVEL ? LOGGER_LEVEL : 'info');
const s3 = new S3();
const awsS3 = new AwsS3(BUCKET_NAME, s3, logger);
const domain = new Domain({
  awsS3, logger
});
const handler = new Handler(domain, logger);

export const getDataProductS3FilesHandler =
  async (input: string): Promise<HandlerOutput> => handler.execute(input);
