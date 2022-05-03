import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { AssignVisibilityFileLFTagsChain } from './chain';
import { AssignVisibilityFileLFTagsLambda } from './lambda';

export type AssignVisibilityFileLFTagsProps = {
  readonly deploymentEnvironment: DeploymentEnvironment;
  readonly stackBaseName: string;
};

export class AssignVisibilityFileLFTags extends Construct {
  /* AWS resources attached to this construct */
  public readonly assignVisibilityFileLFTagsLambda: AssignVisibilityFileLFTagsLambda;

  public constructor(scope: Construct, id: string, props: AssignVisibilityFileLFTagsProps) {
    super(scope, id);
    const { deploymentEnvironment, stackBaseName } = props;

    this.assignVisibilityFileLFTagsLambda =
      new AssignVisibilityFileLFTagsLambda(this, 'AssignVisibilityFileLFTagsLambda', {
        deploymentEnvironment,
        stackBaseName
      });
  }

  public setupChain(failedChain: Chain, successChain: Chain): AssignVisibilityFileLFTagsChain {
    const newChain = new AssignVisibilityFileLFTagsChain(this, 'AssignVisibilityFileLFTagsChain', {
      assignVisibilityFileLFTagsLambda: this.assignVisibilityFileLFTagsLambda.lambda,
      failedChain,
      successChain
    });

    return newChain;
  }
}
