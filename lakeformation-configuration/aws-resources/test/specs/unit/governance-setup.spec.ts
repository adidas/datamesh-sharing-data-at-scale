import { Construct, Stack } from '@aws-cdk/core';
import { CfnDataLakeSettings } from '@aws-cdk/aws-lakeformation';
import { GovernanceSetup } from '../../../cdk/lib/governance-setup';
import devConfig from '../../../cdk/lib/config/governance.config.dev.json';
import { GovernanceSetupRoles } from '../../../cdk/lib/roles';
import { CreateLfTagsCustomResource } from '../../../cdk/lib/create-lf-tags-custom-resource/custom-resource';

const governanceSetupId = 'GovernanceSetup';
const governanceSetupRolesId = 'GovernanceSetupRoles';
const createLfTagsCustomResourceId = 'CreateLfTagsCustomResource';
const deploymentEnvironment = 'dev';
const { Admins: adminRoles } = devConfig.DataLakeSettings;
const admins = {
  admins: [
    { dataLakePrincipalIdentifier: adminRoles[0] },
    { dataLakePrincipalIdentifier: 'roleArn' }
  ]
};
const mockedConstruct: any = jest.fn();

jest.mock('@aws-cdk/core', () => ({
  Construct: jest.fn(),
  Stack: { of: jest.fn(() => ({ account: 'accountId', region: 'eu-west-1' })) }
}));
jest.mock('@aws-cdk/aws-lakeformation', () => ({ CfnDataLakeSettings: jest.fn() }));
jest.mock('../../../cdk/lib/roles', () => ({ GovernanceSetupRoles: jest.fn(() => ({
  dataLakeAdministrator: { roleArn: 'roleArn' }
})) }));
jest.mock('../../../cdk/lib/create-lf-tags-custom-resource/custom-resource', () => ({
  CreateLfTagsCustomResource: jest.fn()
}));

describe('# Lake Formation Setup', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new GovernanceSetup(
      mockedConstruct, governanceSetupId, {
        deploymentEnvironment
      }
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(Stack.of).toHaveBeenCalledTimes(1);
    expect(Construct).toHaveBeenCalledWith(mockedConstruct, governanceSetupId);

    done();
  });

  it('Should create a new GovernanceSetupRoles successfully', (done) => {
    const governanceSetup = new GovernanceSetup(
      mockedConstruct, governanceSetupId, {
        deploymentEnvironment
      }
    );

    expect(GovernanceSetupRoles).toHaveBeenCalledTimes(1);
    expect(GovernanceSetupRoles).toHaveBeenCalledWith(
      governanceSetup, governanceSetupRolesId, {
        deploymentEnvironment,
        accountId: 'accountId',
        region: 'eu-west-1'
      }
    );

    done();
  });

  it('Should add admin', (done) => {
    const governanceSetup = new GovernanceSetup(
      mockedConstruct, governanceSetupId, {
        deploymentEnvironment
      }
    );

    expect(CfnDataLakeSettings).toHaveBeenCalledTimes(1);
    expect(CfnDataLakeSettings).toHaveBeenCalledWith(governanceSetup, governanceSetupId, admins);

    done();
  });

  it('Should create a new CreateLfTagsCustomResource successfully', (done) => {
    const governanceSetup = new GovernanceSetup(
      mockedConstruct, governanceSetupId, {
        deploymentEnvironment
      }
    );

    expect(CreateLfTagsCustomResource).toHaveBeenCalledTimes(1);
    expect(CreateLfTagsCustomResource).toHaveBeenCalledWith(
      governanceSetup, createLfTagsCustomResourceId, {
        deploymentEnvironment,
        accountId: 'accountId',
        dataLakeAdminRole: { roleArn: 'roleArn' }
      }
    );

    done();
  });
});
