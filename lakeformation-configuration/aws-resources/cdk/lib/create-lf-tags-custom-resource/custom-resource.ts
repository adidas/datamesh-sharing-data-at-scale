import { PolicyStatement, IRole } from '@aws-cdk/aws-iam';
import { Function as LambdaFunction, Code, Runtime } from '@aws-cdk/aws-lambda';
import { Construct, CustomResource, Duration } from '@aws-cdk/core';
import { DeploymentEnvironment, DEV_DEPLOYMENT_ENVIRONMENT, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';
import { LakeFormationTag } from './config/lake-formation-tags';
import defaultConfig from './config/lambdas.config.default.json';
import devConfig from './config/lambdas.config.dev.json';
import prodConfig from './config/lambdas.config.prod.json';
import lfDefaultTags from './config/lake-formation-tags.default.json';

export type CreateLfTagsCustomResourceProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly dataLakeAdminRole: IRole;
  readonly accountId: string;
};

export type LambdaConfig = {
  Logging: {
    LogLevel: string;
    RetentionInDays: number;
  };
  Lambda: {
    TimeoutSeconds: number;
    MemorySizeMB: number;
    MaxNameLength: number;
  };
};

export class CreateLfTagsCustomResource extends Construct {
  /* AWS resources attached to this this */
  public readonly customResourceLambda: LambdaFunction;
  public readonly lfTagCustomResources: Array<CustomResource>;

  public constructor(scope: Construct, id: string, props: CreateLfTagsCustomResourceProps) {
    super(scope, id);

    const { deploymentEnvironment, dataLakeAdminRole, accountId } = props;
    const { Logging: configLogging, Lambda: configLambda } = this.loadConfig(deploymentEnvironment);
    const lambdaId = 'CreateLfTagsCustomResource';

    this.customResourceLambda = new LambdaFunction(this, `${ lambdaId }-Function`, {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('./lakeformation-configuration/create-lf-tags-lambda/dist'),
      handler: 'index.createLfTagsHandler',
      description: 'Create Default Lake Formation Tags in governance account',
      timeout: Duration.seconds(configLambda.TimeoutSeconds),
      environment: {
        LOGGER_LEVEL: configLogging.LogLevel,
        DATA_LAKE_ADMIN_ROLE_SESSION_NAME: dataLakeAdminRole.roleName,
        ACCOUNT_ID: accountId
      },
      functionName: `${ lambdaId }-${ deploymentEnvironment }`
      .substring(0, configLambda.MaxNameLength),
      memorySize: configLambda.MemorySizeMB,
      logRetention: configLogging.RetentionInDays
    });

    this.customResourceLambda.addToRolePolicy(
      new PolicyStatement({
        actions: [ 'sts:AssumeRole' ],
        resources: [ dataLakeAdminRole.roleArn ]
      })
    );

    const isMainBranch = deploymentEnvironment === DEV_DEPLOYMENT_ENVIRONMENT
      || deploymentEnvironment === PROD_DEPLOYMENT_ENVIRONMENT;

    this.lfTagCustomResources = (lfDefaultTags as Array<LakeFormationTag>).map((lfTag) =>
      new CustomResource(this, `${ lambdaId }-${ lfTag.TagKey }`, {
        resourceType: 'Custom::CreateLfTag',
        serviceToken: this.customResourceLambda.functionArn,
        properties: {
          Tag: {
            TagKey: isMainBranch ? lfTag.TagKey : `${ lfTag.TagKey }-${ deploymentEnvironment }`,
            TagValues: lfTag.TagValues
          }
        }
      }));
  }

  private loadConfig(deploymentEnvironment: DeploymentEnvironment): LambdaConfig {
    switch (deploymentEnvironment) {
    case PROD_DEPLOYMENT_ENVIRONMENT: return { ...defaultConfig, ...prodConfig };
    case DEV_DEPLOYMENT_ENVIRONMENT: return { ...defaultConfig, ...devConfig };
    default: return defaultConfig;
    }
  }
}
