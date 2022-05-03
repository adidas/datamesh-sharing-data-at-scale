import { Logger } from '@adidas-data-mesh/common';
import { CloudFormationCustomResourceEvent, Context } from 'aws-lambda';
import { Domain } from './domain';
import {
  CustomResourceStatus, getCustomResourceResponse, isCreateEvent,
  isDeleteEvent, isUpdateEvent, RESOURCE_NOT_CREATED, sendCustomResourceResponse
} from './utils/custom-resource';

export class Handler {
  private readonly domain: Domain;
  private readonly logger: Logger;
  private readonly loggingTag = 'Handler';

  public constructor(domain: Domain, logger: Logger) {
    this.domain = domain;
    this.logger = logger.withTag(this.loggingTag);
  }

  public async execute(input: CloudFormationCustomResourceEvent, context: Context): Promise<void> {
    try {
      this.logger.info('Starting');
      this.logger.debug('Initial Input', input);
      this.logger.debug('Initial Context', context);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ((input as any)?.PhysicalResourceId === RESOURCE_NOT_CREATED) {
        this.logger.debug(`PhysicalResourceId === ${ RESOURCE_NOT_CREATED }`);

        const response = getCustomResourceResponse(context)({
          event: input,
          status: CustomResourceStatus.success,
          physicalResourceId: RESOURCE_NOT_CREATED
        }, this.logger);

        this.logger.debug('CustomResourceResponse -> ', response);

        await sendCustomResourceResponse(input)(response, this.logger);
      } else if (isCreateEvent(input)) {
        this.logger.debug('Is Create Event');

        const physicalResourceId = await this.domain.createDataProductAsset(input);

        const response = getCustomResourceResponse(context)({
          event: input,
          status: CustomResourceStatus.success,
          physicalResourceId
        }, this.logger);

        this.logger.debug('CustomResourceResponse -> ', response);

        await sendCustomResourceResponse(input)(response, this.logger);
      } else if (isUpdateEvent(input)) {
        this.logger.debug('Is Update Event');

        const physicalResourceId = await this.domain.updateDataProductAsset(input);

        const response = getCustomResourceResponse(context)({
          event: input,
          status: CustomResourceStatus.success,
          physicalResourceId
        }, this.logger);

        this.logger.debug('CustomResourceResponse -> ', response);

        await sendCustomResourceResponse(input)(response, this.logger);
      } else if (isDeleteEvent(input)) {
        this.logger.debug('Is Delete Event');

        const physicalResourceId = await this.domain.deleteDataProductAsset(input);

        const response = getCustomResourceResponse(context)({
          event: input,
          status: CustomResourceStatus.success,
          physicalResourceId
        }, this.logger);

        this.logger.debug('CustomResourceResponse -> ', response);

        await sendCustomResourceResponse(input)(response, this.logger);
      } else {
        this.logger.debug('Should never happen');

        const response = getCustomResourceResponse(context)({
          event: input,
          status: CustomResourceStatus.success,
          physicalResourceId: ''
        }, this.logger);

        this.logger.debug('CustomResourceResponse -> ', response);

        await sendCustomResourceResponse(input)(response, this.logger);
      }

      this.logger.info('Finishing');
    } catch (error) {
      this.logger.error(error);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const physicalResourceId = ((input as any).PhysicalResourceId ?? RESOURCE_NOT_CREATED) as string;

      const response = getCustomResourceResponse(context)({
        event: input,
        status: CustomResourceStatus.failed,
        reason: JSON.stringify(error),
        physicalResourceId
      }, this.logger);

      await sendCustomResourceResponse(input)(response, this.logger);
    }
  }
}
