import {expect} from 'chai';
import * as sinon from 'sinon';

import {matchClass} from '../util';
import {RouterRegistry} from '../../lib/router.registry';
import {BodyParsed} from '../../lib/body-parsed.decorator';

describe('@BodyParsed decorator', () => {
  let registry: any,
    getInstanceStub: any;

  beforeEach(() => {
    registry = {
      addBodyParsed: sinon.stub()
    };

    getInstanceStub = sinon.stub(RouterRegistry, 'getInstance');
    getInstanceStub.returns(registry);
  });

  afterEach(() => getInstanceStub.restore());

  it('should add an entry to the registry when added to a method', () => {
    class ClassWithParsedMethods {

      @BodyParsed()
      public parsedMethod(): void {
      }
    }

    expect(registry.addBodyParsed).to.have.been.calledOnce;
    expect(registry.addBodyParsed).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod');
  });

  it('should add an entry to the registry when added to a property', () => {
    class ClassWithParsedProperties {
      @BodyParsed()
      public parsedProperty: any;
    }

    expect(registry.addBodyParsed).to.have.been.calledOnce;
    expect(registry.addBodyParsed).to.have.been.calledWithExactly(matchClass('ClassWithParsedProperties'), 'parsedProperty');
  });
});
