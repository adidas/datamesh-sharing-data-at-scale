import { Construct } from '@aws-cdk/core';
import { Chain } from '@aws-cdk/aws-stepfunctions';
import { EvaluateExpression, LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { getMockObject } from '@adidas-data-mesh/testing';
import {
  CreateGlueDatabaseChain, CreateGlueDatabaseChainProps
} from '../../../../cdk/lib/create-glue-databases/chain';

const parallelFlowType = 'Iam';
const basicStackId = 'CreateGlueDatabaseChain';
const lambdaMock: any = jest.fn();
const successChain: any = jest.fn();
const stackBaseProps: CreateGlueDatabaseChainProps = {
  createGlueDatabasesLambda: lambdaMock,
  successChain,
  parallelFlowType
};
const mockedStack: any = jest.fn();
const secondNextMock = jest.fn();
const firstNextMock = jest.fn(() => ({ next: secondNextMock }));

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({
  JsonPath: { DISCARD: 'JsonPathDISCARD' },
  Chain: { start: jest.fn(() => ({ next: firstNextMock })) }
}));
jest.mock('@aws-cdk/aws-stepfunctions-tasks', () => ({ LambdaInvoke: jest.fn(), EvaluateExpression: jest.fn() }));

describe('# CreateGlueDatabaseChain Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create a new CreateGlueDatabase lambda invoke successfully', (done) => {
    const constructId = `Create Glue ${ parallelFlowType } Database`;
    const construct = new CreateGlueDatabaseChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledTimes(1);
    expect(LambdaInvoke).toHaveBeenCalledWith(construct, constructId, {
      inputPath: '$.glueDatabaseName',
      resultPath: 'JsonPathDISCARD',
      lambdaFunction: lambdaMock,
      payloadResponseOnly: true
    });

    done();
  });

  it('Should create a new EvaluateExpression step for Iam successfully', (done) => {
    const constructId = `Create Glue ${ parallelFlowType } Database Name`;
    const construct = new CreateGlueDatabaseChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(EvaluateExpression).toHaveBeenCalledTimes(1);
    expect(EvaluateExpression).toHaveBeenCalledWith(construct, constructId, {
      /* eslint-disable no-template-curly-in-string */
      expression: '`${ $.dataProductObject.data-product-name }_iam`',
      resultPath: '$.glueDatabaseName'
    });

    done();
  });

  it('Should create a new EvaluateExpression step for LF successfully', (done) => {
    const newParallelFlowType = 'LF';
    const constructId = `Create Glue ${ newParallelFlowType } Database Name`;
    const construct = new CreateGlueDatabaseChain(
      mockedStack, basicStackId, { ...stackBaseProps, parallelFlowType: newParallelFlowType }
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(EvaluateExpression).toHaveBeenCalledTimes(1);
    expect(EvaluateExpression).toHaveBeenCalledWith(construct, constructId, {
      /* eslint-disable no-template-curly-in-string */
      expression: '`${ $.dataProductObject.data-product-name }_lf`',
      resultPath: '$.glueDatabaseName'
    });

    done();
  });

  it('Should create a new CreateGlueDatabaseChain successfully', (done) => {
    new CreateGlueDatabaseChain(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Chain.start).toHaveBeenCalledTimes(1);
    expect(Chain.start).toHaveBeenCalledWith(getMockObject(LambdaInvoke).mock.instances[0]);
    expect(firstNextMock).toHaveBeenCalledTimes(1);
    expect(firstNextMock).toHaveBeenCalledWith(getMockObject(EvaluateExpression).mock.instances[0]);
    expect(secondNextMock).toHaveBeenCalledTimes(1);
    expect(secondNextMock).toHaveBeenCalledWith(successChain);

    done();
  });
});
