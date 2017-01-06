import * as bodyParser from 'body-parser';
import {expect} from 'chai';
import * as sinon from 'sinon';

import {matchClass} from '../../util';
import {RouterRegistry} from '../../../lib/router.registry';
import {BodyParsed, bodyParserJson} from '../../../lib/middleware/body-parsed.decorator';

describe('@BodyParsed decorator', () => {
  let registry: any,
    getInstanceStub: any;

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

      @BodyParsed()
      public parsedMethod(): void {
      }
    }

    expect(registry.addMiddleware).to.have.been.calledOnce;
    expect(registry.addMiddleware).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'parsedMethod', bodyParserJson);
  });

  it('should add an entry to the registry when added to a property', () => {
    class ClassWithParsedProperties {
      @BodyParsed()
      public parsedProperty: any;
    }

    expect(registry.addMiddleware).to.have.been.calledOnce;
    expect(registry.addMiddleware).to.have.been.calledWithExactly(matchClass('ClassWithParsedProperties'), 'parsedProperty', bodyParserJson);
  });
});
