export enum S3PolicyEffect {
  allow = 'Allow',
  deny = 'Deny'
}

export type S3PolicyStatement = {
  readonly Sid?: string;
  readonly Action?: Array<string> | string;
  readonly Resource?: Array<string> | string;
  readonly Effect?: S3PolicyEffect;
  readonly Principal: {
    [principalKey: string]: Array<string> | string;
  };
};

export type S3Policy = {
  readonly Version: string;
  readonly Statement: Array<S3PolicyStatement>;
};
