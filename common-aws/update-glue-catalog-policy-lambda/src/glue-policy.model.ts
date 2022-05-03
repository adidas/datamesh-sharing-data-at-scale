export enum GluePolicyEffect {
  allow = 'Allow',
  deny = 'Deny'
}

export type GluePolicyStatement = {
  readonly Sid?: string;
  readonly Action?: Array<string> | string;
  readonly Resource?: Array<string> | string;
  readonly Effect?: GluePolicyEffect;
  readonly Principal: {
    [principalKey: string]: Array<string> | string;
  };
};

export type GluePolicy = {
  readonly Version: string;
  readonly Statement: Array<GluePolicyStatement>;
};
