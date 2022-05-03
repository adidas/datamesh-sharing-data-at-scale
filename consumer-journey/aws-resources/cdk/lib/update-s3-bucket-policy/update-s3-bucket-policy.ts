import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { DeploymentEnvironment } from '@adidas-data-mesh/common';
import { UpdateS3BucketPolicyChain } from './chain';
import { UpdateS3BucketPolicyLambda } from './lambda';

export type UpdateS3BucketPolicyProps = {
  readonly stackBaseName: string;
  readonly deploymentEnvironment: DeploymentEnvironment;
};

export class UpdateS3BucketPolicy extends Construct {
  /* AWS resources attached to this construct */
  private readonly updateS3BucketPolicyLambda: UpdateS3BucketPolicyLambda;

  public constructor(
      scope: Construct, id: string, { deploymentEnvironment, stackBaseName }: UpdateS3BucketPolicyProps
  ) {
    super(scope, id);

    this.updateS3BucketPolicyLambda = new UpdateS3BucketPolicyLambda(this, 'UpdateS3BucketPolicyLambda', {
      deploymentEnvironment,
      stackBaseName
    });
  }

  public setupChain(successChain: Chain): UpdateS3BucketPolicyChain {
    const newChain = new UpdateS3BucketPolicyChain(this, 'UpdateS3BucketPolicyChain', {
      updateS3BucketPolicyLambda: this.updateS3BucketPolicyLambda.lambda,
      successChain
    });

    return newChain;
  }
}
