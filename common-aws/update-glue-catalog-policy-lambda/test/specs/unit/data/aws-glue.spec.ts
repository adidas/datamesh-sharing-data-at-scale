import { Logger } from '@adidas-data-mesh/common';
import { AwsGlue } from '../../../../src/data/aws-glue';
import { GluePolicyStatement, GluePolicyEffect, GluePolicy } from '../../../../src/glue-policy.model';

const logger = Logger.silent();

const region = 'eu-west-1';
const catalogAccountId = '123456789123';
const lakeformationSIDPolicyName = 'AllowFullCatalogAccess';
const glueCatalogPolicyStatement: GluePolicyStatement = {
  Sid: lakeformationSIDPolicyName,
  Effect: GluePolicyEffect.allow,
  Action: 'glue:*',
  Resource: [
    `arn:aws:glue:${ region }:${ catalogAccountId }:catalog`,
    `arn:aws:glue:${ region }:${ catalogAccountId }:database/*`,
    `arn:aws:glue:${ region }:${ catalogAccountId }:table/*/*`
  ],
  Principal: {
    AWS: [ ]
  }
};
const glueSparePolicyStatement: GluePolicyStatement = {
  Sid: 'foobar',
  Effect: GluePolicyEffect.allow,
  Action: 'glue:*',
  Resource: [ '*' ],
  Principal: { AWS: [ ] }
};
const gluePolicy: GluePolicy = {
  Version: '2012-10-17',
  Statement: [ glueSparePolicyStatement, glueCatalogPolicyStatement ]
};
const getResourcePolicyResponse = {
  PolicyInJson: JSON.stringify(gluePolicy)
};
const glue: any = {};
const getResourcePolicyMock = jest.fn(async () => Promise.resolve(getResourcePolicyResponse));
const putResourcePolicyMock = jest.fn(async () => Promise.resolve());

describe('# AwsGlue', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    glue.getResourcePolicy = jest.fn(() => ({ promise: getResourcePolicyMock }));
    glue.putResourcePolicy = jest.fn(() => ({ promise: putResourcePolicyMock }));
  });

  describe('getGlueCatalogPolicy()', () => {
    it('Should getGlueCatalogPolicy successfully', async () => {
      const awsGlue = new AwsGlue(glue, catalogAccountId, region, logger);

      const response = await awsGlue.getGlueCatalogPolicy();

      expect(getResourcePolicyMock).toHaveBeenCalledTimes(1);
      expect(glue.getResourcePolicy).toHaveBeenCalledTimes(1);
      expect(glue.getResourcePolicy).toHaveBeenCalledWith();
      expect(response).toEqual(gluePolicy);
    });

    it('Should getGlueCatalogPolicy successfully when there is no AllowFullCatalogAccess statement', async () => {
      const awsGlue = new AwsGlue(glue, catalogAccountId, region, logger);
      const newGluePolicy: GluePolicy = {
        Version: '2012-10-17',
        Statement: [ glueSparePolicyStatement ]
      };
      const newGetResourcePolicyResponse = {
        PolicyInJson: JSON.stringify(newGluePolicy)
      };

      getResourcePolicyMock.mockResolvedValue(newGetResourcePolicyResponse);

      const response = await awsGlue.getGlueCatalogPolicy();

      expect(getResourcePolicyMock).toHaveBeenCalledTimes(1);
      expect(glue.getResourcePolicy).toHaveBeenCalledTimes(1);
      expect(glue.getResourcePolicy).toHaveBeenCalledWith();
      expect(response).toEqual(gluePolicy);
    });

    it('Should getGlueCatalogPolicy successfully when there is no glue policy yet', async () => {
      const awsGlue = new AwsGlue(glue, catalogAccountId, region, logger);
      const noPolicyFound = 'EntityNotFoundException';
      const awsError = {
        code: noPolicyFound
      };

      getResourcePolicyMock.mockRejectedValue(awsError);

      const response = await awsGlue.getGlueCatalogPolicy();

      expect(getResourcePolicyMock).toHaveBeenCalledTimes(1);
      expect(glue.getResourcePolicy).toHaveBeenCalledTimes(1);
      expect(glue.getResourcePolicy).toHaveBeenCalledWith();
      expect(response).toEqual({
        Version: '2012-10-17',
        Statement: [ glueCatalogPolicyStatement ]
      });
    });

    it('Should throw an error since no PolicyInJson has been found', async () => {
      const awsGlue = new AwsGlue(glue, catalogAccountId, region, logger);
      const newGetResourcePolicyResponse = {};
      const errorMessage = 'No policy has been found';
      const unexpectedError = new Error(errorMessage);

      getResourcePolicyMock.mockResolvedValue(newGetResourcePolicyResponse as any);

      await expect(async () => awsGlue.getGlueCatalogPolicy())
          .rejects.toThrow(unexpectedError);
      expect(getResourcePolicyMock).toHaveBeenCalledTimes(1);
      expect(glue.getResourcePolicy).toHaveBeenCalledTimes(1);
      expect(glue.getResourcePolicy).toHaveBeenCalledWith();
    });
  });

  describe('setGluePolicy()', () => {
    it('Should setGluePolicy successfully', async () => {
      const awsGlue = new AwsGlue(glue, catalogAccountId, region, logger);

      await awsGlue.setGluePolicy(gluePolicy);

      expect(putResourcePolicyMock).toHaveBeenCalledTimes(1);
      expect(glue.putResourcePolicy).toHaveBeenCalledTimes(1);
      expect(glue.putResourcePolicy).toHaveBeenCalledWith({
        PolicyInJson: JSON.stringify(gluePolicy),
        EnableHybrid: 'TRUE'
      });
    });

    it('Should throw an error since aws service has failed', async () => {
      const awsGlue = new AwsGlue(glue, catalogAccountId, region, logger);
      const unexpectedError = new Error('There has been an error');

      putResourcePolicyMock.mockRejectedValue(unexpectedError);

      await expect(async () => awsGlue.setGluePolicy(gluePolicy))
          .rejects.toThrow(unexpectedError);
      expect(putResourcePolicyMock).toHaveBeenCalledTimes(1);
      expect(glue.putResourcePolicy).toHaveBeenCalledTimes(1);
      expect(glue.putResourcePolicy).toHaveBeenCalledWith({
        PolicyInJson: JSON.stringify(gluePolicy),
        EnableHybrid: 'TRUE'
      });
    });
  });
});
