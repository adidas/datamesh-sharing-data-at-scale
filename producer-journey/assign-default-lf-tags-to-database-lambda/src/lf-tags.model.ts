export type LakeFormationTag = {
  readonly TagKey: string;
  readonly TagValues: Array<string>;
};

export enum VisibilityLFTagValues {
  internal = 'internal',
  public = 'public',
  confidential = 'confidential'
}

export const visibilityLFTag: LakeFormationTag = {
  TagKey: 'visibility',
  TagValues: [ VisibilityLFTagValues.confidential, VisibilityLFTagValues.internal, VisibilityLFTagValues.public ]
};

export enum PciLFTagValues {
  true = 'true',
  false = 'false'
}

export const pciLFTag: LakeFormationTag = {
  TagKey: 'pci',
  TagValues: [ PciLFTagValues.true, PciLFTagValues.false ]
};

export enum PiiLFTagValues {
  true = 'true',
  false = 'false'
}

export const piiLFTag: LakeFormationTag = {
  TagKey: 'pii',
  TagValues: [ PiiLFTagValues.true, PiiLFTagValues.false ]
};

export enum DataProductLFTagValues {
  access = 'access'
}
