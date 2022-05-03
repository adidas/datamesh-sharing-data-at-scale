export type LakeFormationTag = {
  readonly TagKey: string;
  readonly TagValues: Array<string>;
};

export enum DataProductLFTagValues {
  access = 'access'
}

export enum CommonLFTagKeys {
  pci = 'pci',
  pii = 'pii',
  visibility = 'visibility'
}

export enum PciLFTagValues {
  true = 'true',
  false = 'false'
}

export enum PiiLFTagValues {
  true = 'true',
  false = 'false'
}

export enum VisibilityLFTagValues {
  public = 'public',
  internal = 'internal',
  confidential = 'confidential'
}
