import { Construct, Stack } from '@aws-cdk/core';
import { CfnDataLakeSettings } from '@aws-cdk/aws-lakeformation';
import { DeploymentEnvironment, PROD_DEPLOYMENT_ENVIRONMENT } from '@adidas-data-mesh/common';
import devConfig from './config/governance.config.dev.json';
import prodConfig from './config/governance.config.prod.json';
import { GovernanceSetupRoles } from './roles';
import { CreateLfTagsCustomResource } from './create-lf-tags-custom-resource/custom-resource';

export type GovernanceSetupConfig = {
  DataLakeSettings: {
    Admins: Array<string>;
  };
};

export type AdminIdentifier = {
  dataLakePrincipalIdentifier: string;
};

export type GovernanceSetupProps = {
  deploymentEnvironment: DeploymentEnvironment;
};

export class GovernanceSetup extends Construct {
  /* AWS resources attached to this construct */
  public readonly governanceSetupRoles: GovernanceSetupRoles;
  public readonly governanceSetup: CfnDataLakeSettings;
  public readonly createLfTagsCustomResource: CreateLfTagsCustomResource;

  public constructor(scope: Construct, id: string, props: GovernanceSetupProps) {
    super(scope, id);

    const { deploymentEnvironment } = props;
    const { account, region } = Stack.of(this);

    this.governanceSetupRoles = new GovernanceSetupRoles(this, 'GovernanceSetupRoles', {
      deploymentEnvironment,
      accountId: account,
      region
    });

    const { DataLakeSettings: dataLakeSettings } = this.loadConfig(deploymentEnvironment);

    const dataLakeAdmins = [
      ...dataLakeSettings.Admins.map<AdminIdentifier>((admin) => ({ dataLakePrincipalIdentifier: admin })),
      { dataLakePrincipalIdentifier: this.governanceSetupRoles.dataLakeAdministrator.roleArn }
    ];

    this.governanceSetup = new CfnDataLakeSettings(this, 'GovernanceSetup', { admins: dataLakeAdmins });

    this.createLfTagsCustomResource = new CreateLfTagsCustomResource(
      this, 'CreateLfTagsCustomResource', {
        deploymentEnvironment,
        accountId: account,
        dataLakeAdminRole: this.governanceSetupRoles.dataLakeAdministrator
      }
    );
  }

  private loadConfig(deploymentEnvironment: DeploymentEnvironment): GovernanceSetupConfig {
    return deploymentEnvironment === PROD_DEPLOYMENT_ENVIRONMENT ? prodConfig : devConfig;
  }
}
