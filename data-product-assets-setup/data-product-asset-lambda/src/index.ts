import { S3, EventBridge } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';
import { CloudFormationCustomResourceHandler } from 'aws-lambda';
import { Domain } from './domain';
import { Handler } from './handler';
import { AwsS3 } from './data/aws-s3';
import { AwsEventBridge } from './data/aws-event-bridge';

type LambdaEnvironment = {
  LOGGER_LEVEL?: string;
  BUCKET_NAME: string;
  EVENT_BUS: string;
};

const {
  LOGGER_LEVEL, BUCKET_NAME, EVENT_BUS
} = process.env as LambdaEnvironment;

const logger = Logger.withLevel(LOGGER_LEVEL ? LOGGER_LEVEL : 'info');
const eventBridge = new EventBridge();
const awsEventBridge = new AwsEventBridge(eventBridge, EVENT_BUS, logger);
const s3 = new S3();
const awsS3 = new AwsS3(s3, logger);
const domain = new Domain({
  bucketName: BUCKET_NAME,
  awsS3,
  awsEventBridge,
  logger
});
const handler = new Handler(domain, logger);

export const dataProductAssetHandler: CloudFormationCustomResourceHandler =
  async (input, context): Promise<void> => handler.execute(input, context);
