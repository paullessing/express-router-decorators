import {expect} from 'chai';
import * as express from 'express';
import * as sinon from 'sinon';

import {matchClass} from '../util';
import {RouterRegistry} from '../../lib/router.registry';
import {Use} from '../../lib/use.decorator';
import {UseType} from '../../lib/decorators.interfaces';

describe('@Use decorator', () => {
  let registry: any,
    getInstanceStub: Sinon.SinonStub;

  beforeEach(() => {
    registry = {
      addUse: sinon.stub()
    };

    getInstanceStub = sinon.stub(RouterRegistry, 'getInstance');
    getInstanceStub.returns(registry);
  });

  afterEach(() => getInstanceStub.restore());

  //================//
  //  No Arguments  //
  //================//
  it('should register a MIDDLEWARE use without a path when Use() is called without arguments on a method', () => {
    class ClassWithParsedMethods {
      @Use()
      public doMiddlewareThing(req: express.Request, res: express.Response, next: express.NextFunction): void {
      }
    }

    expect(registry.addUse).to.have.been.calledOnce;
    expect(registry.addUse).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'doMiddlewareThing', UseType.MIDDLEWARE_FUNCTION, undefined);
  });

  it('should register a MIDDLEWARE use without a path when Use() is called without arguments on a property', () => {
    class ClassWithParsedProperties {
      @Use()
      public middlewareFunctionCallback: express.RequestHandler;
    }

    expect(registry.addUse).to.have.been.calledOnce;
    expect(registry.addUse).to.have.been.calledWithExactly(matchClass('ClassWithParsedProperties'), 'middlewareFunctionCallback', UseType.MIDDLEWARE_FUNCTION, undefined);
  });

  //=======================//
  //  UseType but no Path  //
  //=======================//
  it('should register a use with the correct UseType and without a path when Use() is called on a method with only the UseType', () => {
    class ClassWithParsedMethods {
      @Use(UseType.GETTER)
      public getMiddleware(): express.RequestHandler { return null; }
    }

    expect(registry.addUse).to.have.been.calledOnce;
    expect(registry.addUse).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'getMiddleware', UseType.GETTER, undefined);
  });

  it('should register a use with the correct UseType and without a path when Use() is called on a property with only the UseType', () => {
    class ClassWithParsedProperties {
      @Use(UseType.GETTER)
      public middlewareGetter: () => express.RequestHandler;
    }

    expect(registry.addUse).to.have.been.calledOnce;
    expect(registry.addUse).to.have.been.calledWithExactly(matchClass('ClassWithParsedProperties'), 'middlewareGetter', UseType.GETTER, undefined);
  });

  //=======================//
  //  Path but no UseType  //
  //=======================//
  it('should register a MIDDLEWARE use with the correct path when Use() is called on a method with only the path', () => {
    class ClassWithParsedMethods {
      @Use('/foo')
      public getMiddleware(): express.RequestHandler { return null; }
    }

    expect(registry.addUse).to.have.been.calledOnce;
    expect(registry.addUse).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'getMiddleware', UseType.MIDDLEWARE_FUNCTION, '/foo');
  });

  it('should register a MIDDLEWARE use with the correct path when Use() is called on a property with only the path', () => {
    class ClassWithParsedProperties {
      @Use('/foo')
      public middlewareGetter: () => express.RequestHandler;
    }

    expect(registry.addUse).to.have.been.calledOnce;
    expect(registry.addUse).to.have.been.calledWithExactly(matchClass('ClassWithParsedProperties'), 'middlewareGetter', UseType.MIDDLEWARE_FUNCTION, '/foo');
  });

  it('should register a MIDDLEWARE use with the correct paths when Use() is called on a method with only a path array', () => {
    class ClassWithParsedMethods {
      @Use(['/foo', '/bar'])
      public getMiddleware(): express.RequestHandler { return null; }
    }

    expect(registry.addUse).to.have.been.calledOnce;
    expect(registry.addUse).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'getMiddleware', UseType.MIDDLEWARE_FUNCTION, ['/foo', '/bar']);
  });

  it('should register a MIDDLEWARE use with the correct paths when Use() is called on a property with only a path array', () => {
    class ClassWithParsedProperties {
      @Use(['/foo', '/bar'])
      public middlewareGetter: () => express.RequestHandler;
    }

    expect(registry.addUse).to.have.been.calledOnce;
    expect(registry.addUse).to.have.been.calledWithExactly(matchClass('ClassWithParsedProperties'), 'middlewareGetter', UseType.MIDDLEWARE_FUNCTION, ['/foo', '/bar']);
  });

  //====================//
  //  Path and UseType  //
  //====================//
  it('should register a use with the correct UseType and the correct path when Use() is called on a method with all arguments', () => {
    class ClassWithParsedMethods {
      @Use('/foo', UseType.ROUTER)
      public getMiddleware(): express.RequestHandler { return null; }
    }

    expect(registry.addUse).to.have.been.calledOnce;
    expect(registry.addUse).to.have.been.calledWithExactly(matchClass('ClassWithParsedMethods'), 'getMiddleware', UseType.ROUTER, '/foo');
  });

  it('should register a use with the correct UseType and the correct path when Use() is called on a property with all arguments', () => {
    class ClassWithParsedProperties {
      @Use('/foo', UseType.ROUTER)
      public middlewareGetter: () => express.RequestHandler;
    }

    expect(registry.addUse).to.have.been.calledOnce;
    expect(registry.addUse).to.have.been.calledWithExactly(matchClass('ClassWithParsedProperties'), 'middlewareGetter', UseType.ROUTER, '/foo');
  });
});
