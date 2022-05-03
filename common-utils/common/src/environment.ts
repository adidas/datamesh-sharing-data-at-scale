/**
 * Deployment environment used for identifying in which environment is being deployed.
 * It takes several values regarding the sort of branch is deploying the aws app:
 * Production branch: prod
 * Development branch: dev
 * Feature branch: ticket-id
 */
export type DeploymentEnvironment = 'dev' | 'prod' | `${ string }${ string }${ string }-${ number }`;

export const PROD_DEPLOYMENT_ENVIRONMENT: DeploymentEnvironment = 'prod';

export const DEV_DEPLOYMENT_ENVIRONMENT: DeploymentEnvironment = 'dev';
