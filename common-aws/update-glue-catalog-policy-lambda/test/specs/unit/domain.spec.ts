import { Logger } from '@adidas-data-mesh/common';
import { Domain } from '../../../src/domain';
import {
  GluePolicy, GluePolicyEffect, GluePolicyStatement
} from '../../../src/glue-policy.model';

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
  Statement: [ glueCatalogPolicyStatement, glueSparePolicyStatement ]
};
const domainInput = '123123123123';
const awsGlue: any = {};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsGlue.getGlueCatalogPolicy = jest.fn().mockResolvedValue(gluePolicy);
    awsGlue.setGluePolicy = jest.fn(async () => Promise.resolve());
  });

  it('Should execute the domain successfully if there are no principals already', async () => {
    const domain = new Domain({ awsGlue, logger });
    const executeInput = domainInput;

    await domain.execute(executeInput);

    expect(awsGlue.getGlueCatalogPolicy).toHaveBeenCalledTimes(1);
    expect(awsGlue.getGlueCatalogPolicy).toHaveBeenCalledWith();
    expect(awsGlue.setGluePolicy).toHaveBeenCalledTimes(1);
    expect(awsGlue.setGluePolicy).toHaveBeenCalledWith({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: lakeformationSIDPolicyName,
          Effect: GluePolicyEffect.allow,
          Action: 'glue:*',
          Resource: [
            `arn:aws:glue:${ region }:${ catalogAccountId }:catalog`,
            `arn:aws:glue:${ region }:${ catalogAccountId }:database/*`,
            `arn:aws:glue:${ region }:${ catalogAccountId }:table/*/*`
          ],
          Principal: {
            AWS: [ `arn:aws:iam::${ domainInput }:root` ]
          }
        }, glueSparePolicyStatement
      ]
    });
  });

  it('Should execute the domain successfully if there is just one principal already', async () => {
    const domain = new Domain({ awsGlue, logger });
    const executeInput = domainInput;
    const awsPrincipal = 'arn:aws:iam::fake:root';
    const newGluePolicyStatement: GluePolicyStatement = {
      Sid: lakeformationSIDPolicyName,
      Effect: GluePolicyEffect.allow,
      Action: 'glue:*',
      Resource: [
        `arn:aws:glue:${ region }:${ catalogAccountId }:catalog`,
        `arn:aws:glue:${ region }:${ catalogAccountId }:database/*`,
        `arn:aws:glue:${ region }:${ catalogAccountId }:table/*/*`
      ],
      Principal: {
        AWS: awsPrincipal
      }
    };
    const newGluePolicy: GluePolicy = {
      Version: '2012-10-17',
      Statement: [ newGluePolicyStatement, glueSparePolicyStatement ]
    };

    awsGlue.getGlueCatalogPolicy = jest.fn().mockResolvedValue(newGluePolicy);
    await domain.execute(executeInput);

    expect(awsGlue.getGlueCatalogPolicy).toHaveBeenCalledTimes(1);
    expect(awsGlue.getGlueCatalogPolicy).toHaveBeenCalledWith();
    expect(awsGlue.setGluePolicy).toHaveBeenCalledTimes(1);
    expect(awsGlue.setGluePolicy).toHaveBeenCalledWith({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: lakeformationSIDPolicyName,
          Effect: GluePolicyEffect.allow,
          Action: 'glue:*',
          Resource: [
            `arn:aws:glue:${ region }:${ catalogAccountId }:catalog`,
            `arn:aws:glue:${ region }:${ catalogAccountId }:database/*`,
            `arn:aws:glue:${ region }:${ catalogAccountId }:table/*/*`
          ],
          Principal: {
            AWS: [ awsPrincipal, `arn:aws:iam::${ domainInput }:root` ]
          }
        }, glueSparePolicyStatement
      ]
    });
  });

  it('Should execute the domain successfully if there are more than one principal already', async () => {
    const domain = new Domain({ awsGlue, logger });
    const executeInput = domainInput;
    const awsPrincipal = [ 'arn:aws:iam::fake1:root', 'arn:aws:iam::fake2:root' ];
    const newGluePolicyStatement: GluePolicyStatement = {
      Sid: lakeformationSIDPolicyName,
      Effect: GluePolicyEffect.allow,
      Action: 'glue:*',
      Resource: [
        `arn:aws:glue:${ region }:${ catalogAccountId }:catalog`,
        `arn:aws:glue:${ region }:${ catalogAccountId }:database/*`,
        `arn:aws:glue:${ region }:${ catalogAccountId }:table/*/*`
      ],
      Principal: {
        AWS: awsPrincipal
      }
    };
    const newGluePolicy: GluePolicy = {
      Version: '2012-10-17',
      Statement: [ newGluePolicyStatement, glueSparePolicyStatement ]
    };

    awsGlue.getGlueCatalogPolicy = jest.fn().mockResolvedValue(newGluePolicy);
    await domain.execute(executeInput);

    expect(awsGlue.getGlueCatalogPolicy).toHaveBeenCalledTimes(1);
    expect(awsGlue.getGlueCatalogPolicy).toHaveBeenCalledWith();
    expect(awsGlue.setGluePolicy).toHaveBeenCalledTimes(1);
    expect(awsGlue.setGluePolicy).toHaveBeenCalledWith({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: lakeformationSIDPolicyName,
          Effect: GluePolicyEffect.allow,
          Action: 'glue:*',
          Resource: [
            `arn:aws:glue:${ region }:${ catalogAccountId }:catalog`,
            `arn:aws:glue:${ region }:${ catalogAccountId }:database/*`,
            `arn:aws:glue:${ region }:${ catalogAccountId }:table/*/*`
          ],
          Principal: {
            AWS: [ ...awsPrincipal, `arn:aws:iam::${ domainInput }:root` ]
          }
        }, glueSparePolicyStatement
      ]
    });
  });

  it('Should execute the domain successfully if the producer principal already exists', async () => {
    const domain = new Domain({ awsGlue, logger });
    const executeInput = domainInput;
    const awsPrincipal = [ 'arn:aws:iam::fake1:root', `arn:aws:iam::${ domainInput }:root` ];
    const newGluePolicyStatement: GluePolicyStatement = {
      Sid: lakeformationSIDPolicyName,
      Effect: GluePolicyEffect.allow,
      Action: 'glue:*',
      Resource: [
        `arn:aws:glue:${ region }:${ catalogAccountId }:catalog`,
        `arn:aws:glue:${ region }:${ catalogAccountId }:database/*`,
        `arn:aws:glue:${ region }:${ catalogAccountId }:table/*/*`
      ],
      Principal: {
        AWS: awsPrincipal
      }
    };
    const newGluePolicy: GluePolicy = {
      Version: '2012-10-17',
      Statement: [ newGluePolicyStatement, glueSparePolicyStatement ]
    };

    awsGlue.getGlueCatalogPolicy = jest.fn().mockResolvedValue(newGluePolicy);
    await domain.execute(executeInput);

    expect(awsGlue.getGlueCatalogPolicy).toHaveBeenCalledTimes(1);
    expect(awsGlue.getGlueCatalogPolicy).toHaveBeenCalledWith();
    expect(awsGlue.setGluePolicy).toHaveBeenCalledTimes(1);
    expect(awsGlue.setGluePolicy).toHaveBeenCalledWith({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: lakeformationSIDPolicyName,
          Effect: GluePolicyEffect.allow,
          Action: 'glue:*',
          Resource: [
            `arn:aws:glue:${ region }:${ catalogAccountId }:catalog`,
            `arn:aws:glue:${ region }:${ catalogAccountId }:database/*`,
            `arn:aws:glue:${ region }:${ catalogAccountId }:table/*/*`
          ],
          Principal: {
            AWS: awsPrincipal
          }
        }, glueSparePolicyStatement
      ]
    });
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsGlue, logger });
    const executeInput = domainInput;
    const unexpectedError = new Error('There has been an error');

    awsGlue.getGlueCatalogPolicy = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(executeInput))
        .rejects.toThrow(unexpectedError);
    expect(awsGlue.getGlueCatalogPolicy).toHaveBeenCalledTimes(1);
    expect(awsGlue.getGlueCatalogPolicy).toHaveBeenCalledWith();
  });
});
