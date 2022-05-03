import {
  AccountRootPrincipal, CompositePrincipal, Effect, PolicyDocument, PolicyStatement, IRole, Role, ServicePrincipal
} from '@aws-cdk/aws-iam';
import { Construct } from '@aws-cdk/core';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';

export type GovernanceSetupRolesProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly region: string;
  readonly accountId: string;
};

export class GovernanceSetupRoles extends Construct {
  /* AWS resources attached to this this */
  public readonly dataLakeAdministrator: IRole;

  public constructor(scope: Construct, id: string, props: GovernanceSetupRolesProps) {
    super(scope, id);

    const { deploymentEnvironment, accountId, region } = props;
    const roleName = `data-lake-administrator-${ deploymentEnvironment }`;
    const dataLakeAdministratorRoleRegion = 'eu-west-1';

    this.dataLakeAdministrator = region === dataLakeAdministratorRoleRegion
      ? this.createDataLakeAdministratorRole(roleName)
      : this.importDataLakeAdministratorRole(roleName, accountId);
  }

  private createDataLakeAdministratorRole(roleName: string) {
    return new Role(this, 'DataLakeAdministrator', {
      roleName,
      description: 'Role for being a data lake administrator in order to perform automated processes',
      assumedBy: new CompositePrincipal(
        new AccountRootPrincipal(),
        new ServicePrincipal('glue.amazonaws.com'),
        new ServicePrincipal('lakeformation.amazonaws.com'),
        new ServicePrincipal('lambda.amazonaws.com')
      ),
      managedPolicies: [
        {
          managedPolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
        }
      ],
      inlinePolicies: {
        DataLakeAdmin: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: [ 'lakeformation:*', 'glue:*', 's3:*' ],
              resources: [ '*' ]
            })
          ]
        })
      }
    });
  }

  private importDataLakeAdministratorRole(roleName: string, accountId: string) {
    const roleArn = `arn:aws:iam::${ accountId }:role/${ roleName }`;

    return Role.fromRoleArn(this, 'DataLakeAdministrator', roleArn);
  }
}
