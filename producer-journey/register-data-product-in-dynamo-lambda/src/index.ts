import { Logger } from '@adidas-data-mesh/common';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Domain } from './domain';
import { Handler, HandlerInput } from './handler';
import { AwsDynamoDB } from './data/aws-dynamodb';

type LambdaEnvironment = {
  LOGGER_LEVEL?: string;
  DYNAMODB_TABLE_NAME: string;
};

const {
  LOGGER_LEVEL, DYNAMODB_TABLE_NAME
} = process.env as LambdaEnvironment;

const logger = Logger.withLevel(LOGGER_LEVEL ? LOGGER_LEVEL : 'info');
const dynamodbClient = new DocumentClient();
const awsDynamoDB = new AwsDynamoDB(dynamodbClient, DYNAMODB_TABLE_NAME, logger);
const domain = new Domain({
  awsDynamoDB,
  logger
});
const handler = new Handler(domain, logger);

export const registerDataProductInDynamoHandler =
  async (input: HandlerInput): Promise<void> => handler.execute(input);
