import { Construct } from '@aws-cdk/core';

/**
 * Retrieves a key-value pair from the context of an AWS cdk app
 *
 * @param { Construct } app - AWS cdk app
 * @param { string } envKey - Key of the key-value pair
 * @param { boolean } required - True if you want to throw an exception in case that
 *   key-value pair is not in the context
 * @returns { T } Value of the key-value pair
 */
export const getEnvValue = <T = string>(app: Construct, envKey: string, required = true): T => {
  const value = app.node.tryGetContext(envKey) as T;

  if (!value && required) {
    throw new Error(`The environment key ${ envKey } is a required parameter`);
  }

  return value;
};
