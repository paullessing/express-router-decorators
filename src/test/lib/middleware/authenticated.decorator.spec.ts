import {expect} from 'chai';
import * as sinon from 'sinon';

import {matchClass} from '../../util';
import {RouterRegistry} from '../../../lib/router.registry';
import {Authenticated, authenticate} from '../../../lib/middleware/authenticated.decorator';

describe('@Authenticated decorator', () => {
  let registry: any,
    getInstanceStub: Sinon.SinonStub;

  beforeEach(() => {
    registry = {
      addMiddleware: sinon.stub()
    };

    getInstanceStub = sinon.stub(RouterRegistry, 'getInstance');
    getInstanceStub.returns(registry);
  });

  afterEach(() => getInstanceStub.restore());

  it('should add an entry to the registry when added to a method', () => {
    class ClassWithParsedMethods {

      @Authenticated()
      public parsedMethod(): void {
      }
    }

    expect(registry.addMiddleware).to.have.been.calledOnce;
    expect(registry.addMiddleware).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', authenticate);
  });

  it('should add an entry to the registry when added to a property', () => {
    class ClassWithParsedProperties {
      @Authenticated()
      public parsedProperty: any;
    }

    expect(registry.addMiddleware).to.have.been.calledOnce;
    expect(registry.addMiddleware).to.have.been.calledWithExactly(matchClass('ClassWithParsedProperties'), 'parsedProperty', authenticate);
  });
});
