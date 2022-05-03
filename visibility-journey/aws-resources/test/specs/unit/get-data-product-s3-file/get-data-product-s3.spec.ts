import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { GetDataProductS3FilesChain } from '../../../../cdk/lib/get-data-product-s3-file/chain';
import {
  GetDataProductS3Files, GetDataProductS3FilesProps
} from '../../../../cdk/lib/get-data-product-s3-file/get-data-product-s3-file';

const basicStackId = 'GetDataProductS3Files';
const failedChain: any = jest.fn();
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();
const lambdaMock: any = jest.fn();
const stackBaseProps: GetDataProductS3FilesProps = {
  getDataProductS3FilesLambda: lambdaMock
};

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/get-data-product-s3-file/chain', () => ({
  GetDataProductS3FilesChain: jest.fn() }));

describe('# GetDataProductS3Files', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new GetDataProductS3Files(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a GetDataProductS3FilesChain construct', (done) => {
    const constructId = 'GetDataProductS3FilesChain';
    const construct = new GetDataProductS3Files(
      mockedStack, basicStackId, stackBaseProps
    );

    const newChain = construct.setupChain(failedChain, successChain);

    expect(GetDataProductS3FilesChain).toHaveBeenCalledTimes(1);
    expect(GetDataProductS3FilesChain).toHaveBeenCalledWith(construct, constructId, {
      getDataProductS3FilesLambda: lambdaMock, failedChain, successChain
    });
    expect(newChain).toEqual(getMockObject(GetDataProductS3FilesChain).mock.instances[0]);

    done();
  });
});
