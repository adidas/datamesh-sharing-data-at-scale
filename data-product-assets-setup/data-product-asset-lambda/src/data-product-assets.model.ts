export type DataProductAccountType = 'aws';

export type DataProductObject = {
  readonly 'data-product-name': string;
  readonly 'data-product-owner': string;
  readonly 'data-product-mantainer': string;
  readonly 'enterprise-system-landscape-information-tracker': string;
  readonly 'source-system': string;
  readonly 'edc-data-objects': Array<string>;
  readonly 'usage-patterns': Array<string>;
  readonly 'dq-rules'?: string;
  readonly 'version': string;
};

export type DataProductProducerInfoObject = {
  readonly 'account-type': DataProductAccountType;
  readonly 'producer-role-arn': string;
  readonly 'producer-account-id': string;
  readonly 'bucket-name': string;
};

export type DataProductInputsObject = {
  readonly inputs: {
    [key: string]: {
      readonly tables: Array<string>;
    };
  };
};

export type DataProductOutputsFileFormat = 'parquet' | 'avro' | 'json' | 'csv' | 'delta';

export type DataProductOutputsPortType = 'blob' | 'stream';

export type DataProductOutputsUnitTime = 'month' | 'year' | 'day';

export type DataProductOutputsObject = {
  readonly outputs: {
    readonly [key: string]: {
      readonly 'file-format': DataProductOutputsFileFormat;
      readonly 'port-type': DataProductOutputsPortType;
      readonly 'location': string;
      readonly 'partition-columns'?: Array<string>;
      readonly 'retention-time'?: {
        readonly 'unit': DataProductOutputsUnitTime;
        readonly 'time': number;
      };
    };
  };
};

export type Visibility = 'internal' | 'public' | 'confidential';

export type DataProductVisibilityObject = {
  readonly tables: Array<{
    readonly name: string;
    readonly visibility: Visibility;
    readonly columns?: Array<{
      readonly name: string;
      readonly pii?: boolean;
      readonly pci?: boolean;
    }>;
  }>;
};

export type DataProductConsumersType = 'iam' | 'lakeformation';

export type DataProductConsumersObject = {
  readonly consumers: Array<{
    readonly 'account': string;
    readonly 'contact': string;
    readonly 'type': DataProductConsumersType;
    readonly 'enterprise-system-landscape-information-tracker': string;
    readonly 'team': string;
    readonly 'consumer-role-arn': string;
  }>;
};

export enum AssetName {
  dataProduct = 'data-product.json',
  dataProductProducerInfo = 'data-product-producer-info.json',
  dataProductInputs = 'data-product-inputs.json',
  dataProductOutputs = 'data-product-outputs.json',
  dataProductVisibility = 'data-product-visibility.json',
  dataProductConsumers = 'data-product-consumers.json'
}

export type DataProductAsset = DataProductObject | DataProductProducerInfoObject | DataProductInputsObject |
DataProductOutputsObject | DataProductVisibilityObject | DataProductConsumersObject;

export type CustomResourceProperties = {
  readonly assetName: AssetName;
  readonly dataProductNameObjectKey: string;
} & DataProductAsset;

/* eslint-disable @typescript-eslint/explicit-module-boundary-types,
@typescript-eslint/no-unsafe-member-access, no-undefined */
export const isDataProductObject = (x: any): x is DataProductObject => x['enterprise-system-landscape-information-tracker'] !== undefined;

export const isDataProductProducerInfoObject = (x: any): x is DataProductProducerInfoObject => x['producer-account-id'] !== undefined;

export const isDataProductInputsObject = (x: any): x is DataProductInputsObject => x.inputs !== undefined;

export const isDataProductOutputsObject = (x: any): x is DataProductOutputsObject => x.outputs !== undefined;

export const isDataProductVisibilityObject = (x: any): x is DataProductVisibilityObject => x.tables !== undefined;

export const isDataProductConsumersObject = (x: any): x is DataProductConsumersObject => x.consumers !== undefined;
