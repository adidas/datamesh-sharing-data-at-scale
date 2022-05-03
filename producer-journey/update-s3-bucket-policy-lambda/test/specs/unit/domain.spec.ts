import { Logger } from '@adidas-data-mesh/common';
import { Domain } from '../../../src/domain';
import {
  S3Policy, S3PolicyEffect, S3PolicyStatement
} from '../../../src/s3-policy.model';

const logger = Logger.silent();

const centralAccount = '123456789123';
const lakeFormationAdminRoleName = 'lakeFormationAdminRoleName';
const lakeformationSIDPolicyName = 'AllowAccessFromLakeFormationCentral';
const bucketName = 'bucketName';
const producerRoleName = 'lakeformation-producer-role';
const producerRoleAccount = '123123123123';
const producerRoleArn = `arn:aws:iam::${ producerRoleAccount }:role/${ producerRoleName }`;
const s3CatalogPolicyStatement: S3PolicyStatement = {
  Sid: lakeformationSIDPolicyName,
  Effect: S3PolicyEffect.allow,
  Action: [
    's3:ListBucket',
    's3:DeleteObject',
    's3:GetObject',
    's3:PutObject'
  ],
  Resource: [
    `arn:aws:s3:::${ bucketName }`,
    `arn:aws:s3:::${ bucketName }/*`
  ],
  Principal: {
    AWS: [ ]
  }
};
const s3SparePolicyStatement: S3PolicyStatement = {
  Sid: 'foobar',
  Effect: S3PolicyEffect.allow,
  Action: 's3:*',
  Resource: [ '*' ],
  Principal: { AWS: [ ] }
};
const s3Policy: S3Policy = {
  Version: '2012-10-17',
  Statement: [ s3CatalogPolicyStatement, s3SparePolicyStatement ]
};
const newCredentials = {
  accessKeyId: 'accessKeyId',
  secretAccessKey: 'secretAccessKey',
  sessionToken: 'sessionToken'
};
const awsS3: any = {};
const awsSts: any = {};

describe('# Domain', () => {
  afterAll(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    awsSts.getRoleCredentials = jest.fn(async () => Promise.resolve(newCredentials));
    awsS3.getS3BucketResourcePolicy = jest.fn().mockResolvedValue(s3Policy);
    awsS3.withNewCredentials = jest.fn().mockResolvedValue(awsS3);
    awsS3.setS3Policy = jest.fn(async () => Promise.resolve());
  });

  it('Should assume the producer role for awsS3', async () => {
    const domain = new Domain({ awsS3, awsSts, lakeFormationAdminRoleName, centralAccount, logger });

    await domain.execute(bucketName, producerRoleArn);

    expect(awsSts.getRoleCredentials).toHaveBeenCalledTimes(1);
    expect(awsSts.getRoleCredentials).toHaveBeenCalledWith(producerRoleName, producerRoleAccount);
    expect(awsS3.withNewCredentials).toHaveBeenCalledTimes(1);
    expect(awsS3.withNewCredentials).toHaveBeenCalledWith(newCredentials);
  });

  it('Should execute the domain successfully if there are no principals already', async () => {
    const domain = new Domain({ awsS3, awsSts, lakeFormationAdminRoleName, centralAccount, logger });

    await domain.execute(bucketName, producerRoleArn);

    expect(awsS3.getS3BucketResourcePolicy).toHaveBeenCalledTimes(1);
    expect(awsS3.getS3BucketResourcePolicy).toHaveBeenCalledWith(bucketName);
    expect(awsS3.setS3Policy).toHaveBeenCalledTimes(1);
    expect(awsS3.setS3Policy).toHaveBeenCalledWith(bucketName, {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: lakeformationSIDPolicyName,
          Effect: S3PolicyEffect.allow,
          Action: [
            's3:ListBucket',
            's3:DeleteObject',
            's3:GetObject',
            's3:PutObject'
          ],
          Resource: [
            `arn:aws:s3:::${ bucketName }`,
            `arn:aws:s3:::${ bucketName }/*`
          ],
          Principal: {
            AWS: [ `arn:aws:iam::${ centralAccount }:role/${ lakeFormationAdminRoleName }` ]
          }
        }, s3SparePolicyStatement
      ]
    });
  });

  it('Should execute the domain successfully if there is just one principal already', async () => {
    const domain = new Domain({ awsS3, awsSts, lakeFormationAdminRoleName, centralAccount, logger });
    const awsPrincipal = 'arn:aws:iam::fake:root';
    const newS3PolicyStatement: S3PolicyStatement = {
      Sid: lakeformationSIDPolicyName,
      Effect: S3PolicyEffect.allow,
      Action: [
        's3:ListBucket',
        's3:DeleteObject',
        's3:GetObject',
        's3:PutObject'
      ],
      Resource: [
        `arn:aws:s3:::${ bucketName }`,
        `arn:aws:s3:::${ bucketName }/*`
      ],
      Principal: {
        AWS: awsPrincipal
      }
    };
    const newS3Policy: S3Policy = {
      Version: '2012-10-17',
      Statement: [ newS3PolicyStatement, s3SparePolicyStatement ]
    };

    awsS3.getS3BucketResourcePolicy = jest.fn().mockResolvedValue(newS3Policy);
    await domain.execute(bucketName, producerRoleArn);

    expect(awsS3.getS3BucketResourcePolicy).toHaveBeenCalledTimes(1);
    expect(awsS3.getS3BucketResourcePolicy).toHaveBeenCalledWith(bucketName);
    expect(awsS3.setS3Policy).toHaveBeenCalledTimes(1);
    expect(awsS3.setS3Policy).toHaveBeenCalledWith(bucketName, {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: lakeformationSIDPolicyName,
          Effect: S3PolicyEffect.allow,
          Action: [
            's3:ListBucket',
            's3:DeleteObject',
            's3:GetObject',
            's3:PutObject'
          ],
          Resource: [
            `arn:aws:s3:::${ bucketName }`,
            `arn:aws:s3:::${ bucketName }/*`
          ],
          Principal: {
            AWS: [ awsPrincipal, `arn:aws:iam::${ centralAccount }:role/${ lakeFormationAdminRoleName }` ]
          }
        }, s3SparePolicyStatement
      ]
    });
  });

  it('Should execute the domain successfully if there are more than one principal already', async () => {
    const domain = new Domain({ awsS3, awsSts, lakeFormationAdminRoleName, centralAccount, logger });
    const awsPrincipal = [ 'arn:aws:iam::fake1:root', 'arn:aws:iam::fake2:root' ];
    const newS3PolicyStatement: S3PolicyStatement = {
      Sid: lakeformationSIDPolicyName,
      Effect: S3PolicyEffect.allow,
      Action: [
        's3:ListBucket',
        's3:DeleteObject',
        's3:GetObject',
        's3:PutObject'
      ],
      Resource: [
        `arn:aws:s3:::${ bucketName }`,
        `arn:aws:s3:::${ bucketName }/*`
      ],
      Principal: {
        AWS: awsPrincipal
      }
    };
    const newS3Policy: S3Policy = {
      Version: '2012-10-17',
      Statement: [ newS3PolicyStatement, s3SparePolicyStatement ]
    };

    awsS3.getS3BucketResourcePolicy = jest.fn().mockResolvedValue(newS3Policy);
    await domain.execute(bucketName, producerRoleArn);

    expect(awsS3.getS3BucketResourcePolicy).toHaveBeenCalledTimes(1);
    expect(awsS3.getS3BucketResourcePolicy).toHaveBeenCalledWith(bucketName);
    expect(awsS3.setS3Policy).toHaveBeenCalledTimes(1);
    expect(awsS3.setS3Policy).toHaveBeenCalledWith(bucketName, {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: lakeformationSIDPolicyName,
          Effect: S3PolicyEffect.allow,
          Action: [
            's3:ListBucket',
            's3:DeleteObject',
            's3:GetObject',
            's3:PutObject'
          ],
          Resource: [
            `arn:aws:s3:::${ bucketName }`,
            `arn:aws:s3:::${ bucketName }/*`
          ],
          Principal: {
            AWS: [ ...awsPrincipal, `arn:aws:iam::${ centralAccount }:role/${ lakeFormationAdminRoleName }` ]
          }
        }, s3SparePolicyStatement
      ]
    });
  });

  it('Should execute the domain successfully if the producer principal already exists', async () => {
    const domain = new Domain({ awsS3, awsSts, lakeFormationAdminRoleName, centralAccount, logger });
    const awsPrincipal = [ 'arn:aws:iam::fake1:root', `arn:aws:iam::${ centralAccount }:role/${ lakeFormationAdminRoleName }` ];
    const newS3PolicyStatement: S3PolicyStatement = {
      Sid: lakeformationSIDPolicyName,
      Effect: S3PolicyEffect.allow,
      Action: [
        's3:ListBucket',
        's3:DeleteObject',
        's3:GetObject',
        's3:PutObject'
      ],
      Resource: [
        `arn:aws:s3:::${ bucketName }`,
        `arn:aws:s3:::${ bucketName }/*`
      ],
      Principal: {
        AWS: awsPrincipal
      }
    };
    const newS3Policy: S3Policy = {
      Version: '2012-10-17',
      Statement: [ newS3PolicyStatement, s3SparePolicyStatement ]
    };

    awsS3.getS3BucketResourcePolicy = jest.fn().mockResolvedValue(newS3Policy);
    await domain.execute(bucketName, producerRoleArn);

    expect(awsS3.getS3BucketResourcePolicy).toHaveBeenCalledTimes(1);
    expect(awsS3.getS3BucketResourcePolicy).toHaveBeenCalledWith(bucketName);
    expect(awsS3.setS3Policy).toHaveBeenCalledTimes(1);
    expect(awsS3.setS3Policy).toHaveBeenCalledWith(bucketName, {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: lakeformationSIDPolicyName,
          Effect: S3PolicyEffect.allow,
          Action: [
            's3:ListBucket',
            's3:DeleteObject',
            's3:GetObject',
            's3:PutObject'
          ],
          Resource: [
            `arn:aws:s3:::${ bucketName }`,
            `arn:aws:s3:::${ bucketName }/*`
          ],
          Principal: {
            AWS: awsPrincipal
          }
        }, s3SparePolicyStatement
      ]
    });
  });

  it('Should throw an error since the data layer has failed', async () => {
    const domain = new Domain({ awsS3, awsSts, lakeFormationAdminRoleName, centralAccount, logger });
    const unexpectedError = new Error('There has been an error');

    awsS3.getS3BucketResourcePolicy = jest.fn(async () => Promise.reject(unexpectedError));

    await expect(async () => domain.execute(bucketName, producerRoleArn))
        .rejects.toThrow(unexpectedError);
    expect(awsS3.getS3BucketResourcePolicy).toHaveBeenCalledTimes(1);
    expect(awsS3.getS3BucketResourcePolicy).toHaveBeenCalledWith(bucketName);
  });
});
