import { Stack } from '@aws-cdk/core';
import { AwsCommon } from '@adidas-data-mesh/common-aws';
import { getMockObject } from '@adidas-data-mesh/testing';
import { ProducerJourney } from '@adidas-data-mesh/producer-journey';
import { ConsumerJourney } from '@adidas-data-mesh/consumer-journey';
import { VisibilityJourney } from '@adidas-data-mesh/visibility-journey';
import { LakeFormationEnablementJourneys, StackBaseProps } from '../../../../cdk/lib/lakeformation-enablement-journeys';

const basicStackId = 'BasicStack';
const deploymentEnvironment = 'dev';
const stackBaseName = 'stackBaseName';
const dataProductCatalogueBucket: any = {};
const orchestratorEventBus: any = {};
const mockedApp: any = jest.fn();
const stackBaseProps: StackBaseProps = {
  deploymentEnvironment,
  stackBaseName,
  dataProductCatalogueBucket,
  orchestratorEventBus
};
const account = '0123456789';
const region = 'eu-west-1';

jest.mock('@aws-cdk/core', () => ({ Stack: jest.fn(() => ({ account, region })) }));
jest.mock('@adidas-data-mesh/common-aws', () => ({ AwsCommon: jest.fn() }));
jest.mock('@adidas-data-mesh/producer-journey', () => ({ ProducerJourney: jest.fn() }));
jest.mock('@adidas-data-mesh/consumer-journey', () => ({ ConsumerJourney: jest.fn() }));
jest.mock('@adidas-data-mesh/visibility-journey', () => ({ VisibilityJourney: jest.fn() }));

describe('# LakeFormationEnablementJourneys', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should have an AwsCommon construct', (done) => {
    const constructId = 'AwsCommon';
    const lakeFormationMainStack = new LakeFormationEnablementJourneys(
      mockedApp, basicStackId, stackBaseProps
    );

    expect(Stack).toHaveBeenCalledTimes(1);
    expect(AwsCommon).toHaveBeenCalledTimes(1);
    expect(AwsCommon).toHaveBeenCalledWith(lakeFormationMainStack, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName,
      dataProductCatalogueBucket,
      orchestratorEventBus
    });

    done();
  });

  it('Should have a ProducerJourney construct', (done) => {
    const constructId = 'ProducerJourney';
    const lakeFormationMainStack = new LakeFormationEnablementJourneys(
      mockedApp, basicStackId, stackBaseProps
    );

    expect(Stack).toHaveBeenCalledTimes(1);
    expect(ProducerJourney).toHaveBeenCalledTimes(1);
    expect(ProducerJourney).toHaveBeenCalledWith(lakeFormationMainStack, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName,
      awsCommon: getMockObject(AwsCommon).mock.instances[0]
    });

    done();
  });

  it('Should have a ConsumerJourney construct', (done) => {
    const constructId = 'ConsumerJourney';
    const lakeFormationMainStack = new LakeFormationEnablementJourneys(
      mockedApp, basicStackId, stackBaseProps
    );

    expect(Stack).toHaveBeenCalledTimes(1);
    expect(ConsumerJourney).toHaveBeenCalledTimes(1);
    expect(ConsumerJourney).toHaveBeenCalledWith(lakeFormationMainStack, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName,
      awsCommon: getMockObject(AwsCommon).mock.instances[0]
    });

    done();
  });

  it('Should have a VisibilityJourney construct', (done) => {
    const constructId = 'VisibilityJourney';
    const lakeFormationMainStack = new LakeFormationEnablementJourneys(
      mockedApp, basicStackId, stackBaseProps
    );

    expect(Stack).toHaveBeenCalledTimes(1);
    expect(VisibilityJourney).toHaveBeenCalledTimes(1);
    expect(VisibilityJourney).toHaveBeenCalledWith(lakeFormationMainStack, constructId, {
      deploymentEnvironment: stackBaseProps.deploymentEnvironment,
      stackBaseName,
      awsCommon: getMockObject(AwsCommon).mock.instances[0]
    });

    done();
  });
});
