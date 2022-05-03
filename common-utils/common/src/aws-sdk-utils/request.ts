import { Request } from 'aws-sdk';
import { Logger } from '../logger';

// eslint-disable-next-line valid-jsdoc
/**
 * Retrieves a full paginated aws request.
 *
 * @param { Logger } logger - Instance logger
 * @param { Request<D, E> } request - AWS request to be paginated
 * @param { keyof D } itemsAttrPath - AWS attribute which contains the resource list
 *
 * @returns { Promise<D[keyof D]> } A list of full paginated resources from the request
 */
export const getFullPaginatedRequest = async <D, E>(
  logger: Logger, request: Request<D, E>, itemsAttrPath: keyof D
): Promise<D[keyof D]> => {
  let result: Array<any> = [];

  return new Promise((resolve, reject) => request.eachPage((error, data) => {
    if (error) {
      logger.error(error);
      reject(error);

      return false;
    } else if (data) {
      const response = data[itemsAttrPath] as unknown as Array<any>;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      result = [ ...result, ...response ];

      logger.debug('itemsCount', result.length);

      return true;
    }

    logger.info('getFullPaginatedRequest finished with ', result.length);
    resolve(result as unknown as D[keyof D]);

    return false;
  }));
};
