import { Construct } from '@aws-cdk/core';
import { EventBus, EventField, Rule, RuleTargetInput } from '@aws-cdk/aws-events';
import { SfnStateMachine } from '@aws-cdk/aws-events-targets';
import { getMockObject } from '@adidas-data-mesh/testing';
import { StateMachine } from '@aws-cdk/aws-stepfunctions';
import {
  DataProductCatalogueEvent, DataProductCatalogueEventProps, DetailType, EventSources
} from '../../../../../cdk/lib/catalogue-assets-main-stack/event-rule';
import defaultConfig from '../../../../../cdk/lib/catalogue-assets-main-stack/config/event-bridge.config.default.json';

const basicStackId = 'DataProductCatalogueEvent';
const deploymentEnvironment = 'dev';
const stackOfMock = {
  region: 'region',
  account: 'account'
};
const mockedStack: any = jest.fn();
const stackBaseProps: DataProductCatalogueEventProps = {
  deploymentEnvironment
};
// eslint-disable-next-line @typescript-eslint/naming-convention
const { ConsumerJourney, VisibilityJourney, ProducerJourney } = defaultConfig.StepFunctionsJourneysName;

jest.mock('@aws-cdk/core', () => ({ Construct: jest.fn(), Stack: { of: jest.fn(() => stackOfMock) } }));
jest.mock('@aws-cdk/aws-events', () => ({
  Rule: jest.fn(), EventBus: jest.fn(), RuleTargetInput: { fromObject: jest.fn() },
  EventField: { fromPath: jest.fn() }
}));
jest.mock('@aws-cdk/aws-events-targets', () => ({ SfnStateMachine: jest.fn() }));
jest.mock('@aws-cdk/aws-stepfunctions', () => ({ StateMachine: { fromStateMachineArn: jest.fn() } }));

describe('# DataProductCatalogueEvent Construct', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

  it('Should create everything successfully', (done) => {
    new DataProductCatalogueEvent(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(Construct).toHaveBeenCalledTimes(1);
    expect(EventBus).toHaveBeenCalledTimes(1);
    expect(StateMachine.fromStateMachineArn).toHaveBeenCalledTimes(3);
    expect(EventField.fromPath).toHaveBeenCalledTimes(6);
    expect(RuleTargetInput.fromObject).toHaveBeenCalledTimes(3);
    expect(SfnStateMachine).toHaveBeenCalledTimes(3);
    expect(Rule).toHaveBeenCalledTimes(3);

    done();
  });

  it('Should create an event bus successfully', (done) => {
    const constructId = 'DataProductCatalogueEventBus';
    const construct = new DataProductCatalogueEvent(
      mockedStack, basicStackId, stackBaseProps
    );

    expect(EventBus).toHaveBeenCalledWith(construct, constructId, {
      eventBusName: `adidas-data-product-catalog-journeys-orchestrator-${ deploymentEnvironment }`
    });

    done();
  });

  it('Should create a producer event successfully', (done) => {
    const constructId = 'ProducerJourneyEventFromFile';
    const sfnId = 'ProducerStateMachine';
    const construct = new DataProductCatalogueEvent(
      mockedStack, basicStackId, stackBaseProps
    );
    const sfnArn = `arn:aws:states:${ stackOfMock.region }:${ stackOfMock.account }:stateMachine:${ ProducerJourney
    }-${ deploymentEnvironment }`;

    expect(StateMachine.fromStateMachineArn).toHaveBeenNthCalledWith(1, construct, sfnId, sfnArn);
    expect(EventField.fromPath).toHaveBeenNthCalledWith(1, '$.detail.dataProductName');
    expect(EventField.fromPath).toHaveBeenNthCalledWith(2, '$.id');
    expect(RuleTargetInput.fromObject).toHaveBeenNthCalledWith(1, {
      dataProductName: getMockObject(EventField.fromPath).mock.results[0].value,
      correlationId: getMockObject(EventField.fromPath).mock.results[1].value
    });
    expect(SfnStateMachine).toHaveBeenNthCalledWith(1,
      getMockObject(StateMachine.fromStateMachineArn).mock.results[0].value, {
        input: getMockObject(RuleTargetInput.fromObject).mock.results[0].value
      });
    expect(Rule).toHaveBeenNthCalledWith(1, construct, constructId, {
      description: 'Orchestrates producer journey step function from the s3 files',
      ruleName: `producer-journey-from-file-${ deploymentEnvironment }`,
      eventPattern: {
        source: [ EventSources.producer ],
        detailType: [ DetailType.create ]
      },
      targets: [ getMockObject(SfnStateMachine).mock.instances[0] ],
      eventBus: getMockObject(EventBus).mock.instances[0]
    });

    done();
  });

  it('Should create a visibility event successfully', (done) => {
    const construct2Id = 'VisibilityJourneyEventFromSfn';
    const sfnId = 'VisibilityStateMachine';
    const construct = new DataProductCatalogueEvent(
      mockedStack, basicStackId, stackBaseProps
    );
    const sfnArn = `arn:aws:states:${ stackOfMock.region }:${ stackOfMock.account }:stateMachine:${ VisibilityJourney
    }-${ deploymentEnvironment }`;

    expect(StateMachine.fromStateMachineArn).toHaveBeenNthCalledWith(2, construct, sfnId, sfnArn);
    expect(EventField.fromPath).toHaveBeenNthCalledWith(3, '$.detail.dataProductName');
    expect(EventField.fromPath).toHaveBeenNthCalledWith(4, '$.id');
    expect(RuleTargetInput.fromObject).toHaveBeenNthCalledWith(2, {
      dataProductName: getMockObject(EventField.fromPath).mock.results[2].value,
      correlationId: getMockObject(EventField.fromPath).mock.results[3].value
    });
    expect(SfnStateMachine).toHaveBeenNthCalledWith(2,
      getMockObject(StateMachine.fromStateMachineArn).mock.results[1].value, {
        input: getMockObject(RuleTargetInput.fromObject).mock.results[1].value
      });
    expect(Rule).toHaveBeenNthCalledWith(2, construct, construct2Id, {
      description: 'Orchestrates visibility journey step function from others SFN dependencies',
      ruleName: `visibility-journey-from-sfn-${ deploymentEnvironment }`,
      eventPattern: {
        source: [ EventSources.producer ],
        detailType: [ DetailType.finish ]
      },
      targets: [ getMockObject(SfnStateMachine).mock.instances[1] ],
      eventBus: getMockObject(EventBus).mock.instances[0]
    });

    done();
  });

  it('Should create a consumers event successfully', (done) => {
    const construct2Id = 'ConsumerJourneyEventFromSfn';
    const sfnId = 'ConsumerStateMachine';
    const construct = new DataProductCatalogueEvent(
      mockedStack, basicStackId, stackBaseProps
    );
    const sfnArn = `arn:aws:states:${ stackOfMock.region }:${ stackOfMock.account }:stateMachine:${ ConsumerJourney
    }-${ deploymentEnvironment }`;

    expect(StateMachine.fromStateMachineArn).toHaveBeenNthCalledWith(3, construct, sfnId, sfnArn);
    expect(EventField.fromPath).toHaveBeenNthCalledWith(5, '$.detail.dataProductName');
    expect(EventField.fromPath).toHaveBeenNthCalledWith(6, '$.id');
    expect(RuleTargetInput.fromObject).toHaveBeenNthCalledWith(3, {
      dataProductName: getMockObject(EventField.fromPath).mock.results[4].value,
      correlationId: getMockObject(EventField.fromPath).mock.results[5].value
    });
    expect(SfnStateMachine).toHaveBeenNthCalledWith(3,
      getMockObject(StateMachine.fromStateMachineArn).mock.results[2].value, {
        input: getMockObject(RuleTargetInput.fromObject).mock.results[2].value
      });
    expect(Rule).toHaveBeenNthCalledWith(3, construct, construct2Id, {
      description: 'Orchestrates consumer journey step function from others SFN dependencies',
      ruleName: `consumer-journey-from-sfn-${ deploymentEnvironment }`,
      eventPattern: {
        source: [ EventSources.visibility ],
        detailType: [ DetailType.finish ]
      },
      targets: [ getMockObject(SfnStateMachine).mock.instances[2] ],
      eventBus: getMockObject(EventBus).mock.instances[0]
    });

    done();
  });
});
