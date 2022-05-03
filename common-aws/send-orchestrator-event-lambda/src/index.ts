import { EventBridge } from 'aws-sdk';
import { Logger } from '@adidas-data-mesh/common';
import { Context } from 'aws-lambda';
import { Domain } from './domain';
import { Handler, HandlerInput } from './handler';
import { AwsEventBridge } from './data/aws-event-bridge';

type LambdaEnvironment = {
  LOGGER_LEVEL?: string;
  EVENT_BUS: string;
};

const {
  LOGGER_LEVEL, EVENT_BUS
} = process.env as LambdaEnvironment;

const logger = Logger.withLevel(LOGGER_LEVEL ? LOGGER_LEVEL : 'info');
const eventBridge = new EventBridge();
const awsEventBridge = new AwsEventBridge(eventBridge, EVENT_BUS, logger);
const domain = new Domain({
  awsEventBridge, logger
});
const handler = new Handler(domain, logger);

export const sendOrchestratorEventHandler =
  async (input: HandlerInput, ctx: Context): Promise<void> => handler.execute(input, ctx);
