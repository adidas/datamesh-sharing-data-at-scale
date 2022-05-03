import { Construct } from '@aws-cdk/core';
import { getMockObject } from '@adidas-data-mesh/testing';
import { CreateLinkedDatabaseChain } from '../../../../cdk/lib/create-linked-database/chain';
import { CreateLinkedDatabase } from '../../../../cdk/lib/create-linked-database/create-linked-database';
import { CreateLinkedDatabaseLambda } from '../../../../cdk/lib/create-linked-database/lambda';

const basicStackId = 'ConsumerJourney';
const deploymentEnvironment: any = 'dev';
const stackBaseName = 'adidas-Consumer-Journey';
const stackBaseProps = {
  deploymentEnvironment,
  stackBaseName
};
const createLinkedDatabaseLambda = 'CreateLinkedDatabaseLambda';
const successChain: any = jest.fn();
const mockedStack: any = jest.fn();

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn() }));
jest.mock('../../../../cdk/lib/create-linked-database/chain', () => ({
  CreateLinkedDatabaseChain: jest.fn()
}));
jest.mock('../../../../cdk/lib/create-linked-database/lambda', () => ({
  CreateLinkedDatabaseLambda: jest.fn(() => ({ lambda: createLinkedDatabaseLambda }))
}));

describe('# CreateLinkedDatabase', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should initialize the class', (done) => {
    new CreateLinkedDatabase(mockedStack, basicStackId, stackBaseProps);

    expect(Construct).toHaveBeenCalledTimes(1);

    done();
  });

  it('Should have a CreateLinkedDatabaseLambda construct', (done) => {
    const constructId = 'CreateLinkedDatabaseLambda';
    const construct = new CreateLinkedDatabase(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(CreateLinkedDatabaseLambda).toHaveBeenCalledTimes(1);
    expect(CreateLinkedDatabaseLambda).toHaveBeenCalledWith(construct, constructId, {
      deploymentEnvironment,
      stackBaseName
    });

    done();
  });

  it('Should have a CreateLinkedDatabaseChain construct', (done) => {
    const constructId = 'CreateLinkedLFDatabaseChain';
    const construct = new CreateLinkedDatabase(mockedStack, basicStackId, stackBaseProps);

    const newChain = construct.setupChain(successChain);

    expect(CreateLinkedDatabaseChain).toHaveBeenCalledTimes(1);
    expect(CreateLinkedDatabaseChain).toHaveBeenCalledWith(construct, constructId, {
      successChain, createLinkedDatabaseLambda
    });
    expect(newChain).toEqual(getMockObject(CreateLinkedDatabaseChain).mock.instances[0]);

    done();
  });
});
