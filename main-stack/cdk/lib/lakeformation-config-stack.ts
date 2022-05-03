import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { GovernanceSetup } from '@adidas-data-mesh/lakeformation-configuration';

export type StackBaseProps = StackProps & {
  readonly deploymentEnvironment: DeploymentEnvironment;
};

export class LakeformationConfigStack extends Stack {
  public readonly lakeformationConfig: GovernanceSetup;

  public constructor(scope: Construct, id: string, stackProps: StackBaseProps) {
    super(scope, id, stackProps);

    const {
      deploymentEnvironment
    } = stackProps;

    this.lakeformationConfig = new GovernanceSetup(this, 'LakeformationConfig', {
      deploymentEnvironment
    });
  }
}
