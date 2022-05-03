import {
  Role, PolicyDocument, PolicyStatement, CompositePrincipal, AccountRootPrincipal, ServicePrincipal
} from '@aws-cdk/aws-iam';
import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { GovernanceSetupRoles } from '../../../cdk/lib/roles';

const governanceSetupRolesId = 'GovernanceSetupRoles';
const mockedStack: any = jest.fn();
const deploymentEnvironment = 'dev';
const region = 'eu-west-1';
const accountId = 'accountId';
const roleName = `data-lake-administrator-${ deploymentEnvironment }`;

Role.fromRoleArn = jest.fn();

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('@aws-cdk/aws-iam', () => ({
  Role: jest.fn(), PolicyDocument: jest.fn(), PolicyStatement: jest.fn(), Effect: { ALLOW: 'ALLOW' },
  CompositePrincipal: jest.fn(), AccountRootPrincipal: jest.fn(), ServicePrincipal: jest.fn()
}));

describe('# GovernanceSetupRoles', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new GovernanceSetupRoles(mockedStack, governanceSetupRolesId, {
      deploymentEnvironment,
      accountId,
      region
    });

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Construct).toHaveBeenCalledWith(mockedStack, governanceSetupRolesId);
    expect(Role).toHaveBeenCalledTimes(1);
    expect(Role.fromRoleArn).toHaveBeenCalledTimes(0);
    expect(CompositePrincipal).toHaveBeenCalledTimes(1);
    expect(AccountRootPrincipal).toHaveBeenCalledTimes(1);
    expect(ServicePrincipal).toHaveBeenCalledTimes(3);
    expect(PolicyDocument).toHaveBeenCalledTimes(1);
    expect(PolicyStatement).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should create a DataLakeAdministrator role in ireland', (done) => {
    const governanceSetupRoles = new GovernanceSetupRoles(mockedStack, governanceSetupRolesId, {
      deploymentEnvironment,
      accountId,
      region
    });

    expect(AccountRootPrincipal).toHaveBeenCalledWith();
    expect(ServicePrincipal).toHaveBeenNthCalledWith(1, 'glue.amazonaws.com');
    expect(ServicePrincipal).toHaveBeenNthCalledWith(2, 'lakeformation.amazonaws.com');
    expect(ServicePrincipal).toHaveBeenNthCalledWith(3, 'lambda.amazonaws.com');
    expect(CompositePrincipal).toHaveBeenCalledWith(
      getMockObject(AccountRootPrincipal).mock.instances[0],
      getMockObject(ServicePrincipal).mock.instances[0],
      getMockObject(ServicePrincipal).mock.instances[1],
      getMockObject(ServicePrincipal).mock.instances[2]
    );

    // DataLakeAdmin PolicyDocument
    expect(PolicyStatement).toHaveBeenNthCalledWith(1, {
      effect: 'ALLOW',
      actions: [
        'lakeformation:*',
        'glue:*',
        's3:*'
      ],
      resources: [ '*' ]
    });
    expect(PolicyDocument).toHaveBeenNthCalledWith(1, {
      statements: [ getMockObject(PolicyStatement).mock.instances[0] ]
    });

    expect(Role).toHaveBeenCalledWith(governanceSetupRoles, 'DataLakeAdministrator', {
      roleName,
      assumedBy: getMockObject(CompositePrincipal).mock.instances[0],
      description: 'Role for being a data lake administrator in order to perform automated processes',
      managedPolicies: [
        {
          managedPolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
        }
      ],
      inlinePolicies: {
        DataLakeAdmin: getMockObject(PolicyDocument).mock.instances[0]
      }
    });

    done();
  });

  it('Should create a DataLakeAdministrator role in a different region than ireland', (done) => {
    const governanceSetupRoles = new GovernanceSetupRoles(mockedStack, governanceSetupRolesId, {
      deploymentEnvironment,
      accountId,
      region: 'region'
    });
    const roleId = 'DataLakeAdministrator';
    const roleArn = `arn:aws:iam::${ accountId }:role/${ roleName }`;

    expect(Role).toHaveBeenCalledTimes(0);
    expect(Role.fromRoleArn).toHaveBeenCalledTimes(1);
    expect(Role.fromRoleArn).toHaveBeenCalledWith(governanceSetupRoles, roleId, roleArn);

    done();
  });
});
