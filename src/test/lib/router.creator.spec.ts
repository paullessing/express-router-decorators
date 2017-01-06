import {expect} from 'chai';
import * as sinon from 'sinon';

import {RouterCreator} from '../../lib/router.creator';
import {
  EndpointDefinitionType, PathArgument, RouterDecoratorDefinitions, UseType,
  HttpVerb
} from '../../lib/decorators.interfaces';

describe('RouterCreator', () => {
  let routerCreator: RouterCreator,
    routerFactory: any,
    definitions: RouterDecoratorDefinitions,
    router: any,
    registry: any,
    promiseResponse: any,
    wrappedCall: Sinon.SinonStub;

  class RouterClass {}

  beforeEach(() => {
    definitions = {
      middleware: [],
      endpoints: []
    };
    registry = {
      getDefinitions: sinon.stub().returns(definitions)
    };
    wrappedCall = sinon.stub();
    promiseResponse = {
      wrap: sinon.stub().returns(wrappedCall)
    };
    router = {
      use: sinon.stub(),
      get: sinon.stub(),
      post: sinon.stub(),
      put: sinon.stub(),
      patch: sinon.stub(),
      'delete': sinon.stub(),
      options: sinon.stub(),
    };
    routerFactory = sinon.stub().returns(router);

    routerCreator = new RouterCreator(routerFactory, registry, promiseResponse);
  });

  function registryContainsMethod(path: PathArgument, httpVerb: HttpVerb, methodName: string = 'method'): void {
    definitions.endpoints.push({
      type: EndpointDefinitionType.METHOD,
      definition: {
        httpVerb,
        path,
        methodName
      }
    });
  }

  function registryContainsUse(type: UseType, propertyName: string = 'method', path?: PathArgument): void {
    definitions.endpoints.push({
      type: EndpointDefinitionType.USE,
      definition: {
        path,
        type,
        propertyName
      }
    });
  }

  function registryContainsBodyParsed(propertyName: string): void {
    definitions.middleware.push({ propertyName, middleware: sinon.stub() });
  }

  it('should create an express Router', () => {
    const result = routerCreator.createRouter(new RouterClass());

    expect(result).to.equal(router);
    expect(routerFactory).to.have.been.calledOnce;
  });

  it('should not add any properties to the router if no endpoints are defined for the class', () => {
    routerCreator.createRouter(new RouterClass());

    expect(router.use).not.to.have.been.called;
    expect(router.get).not.to.have.been.called;
    expect(router.post).not.to.have.been.called;
    expect(router.put).not.to.have.been.called;
    expect(router.patch).not.to.have.been.called;
    expect(router.delete).not.to.have.been.called;
    expect(router.options).not.to.have.been.called;
  });

  it('should create a wrapped call using promiseResponse of the method when a HTTP verb method is defined', () => {
    class TestRouterClass {
      public doThing(): void {}
    }
    const routerInstance: any = new TestRouterClass();
    routerInstance.doThing = sinon.stub();

    registry.getDefinitions = sinon.stub().withArgs(TestRouterClass).returns({
      middleware: [],
      endpoints: [{
        type: EndpointDefinitionType.METHOD,
        definition: {
          httpVerb: 'get',
          path: '/foo',
          methodName: 'doThing'
        }
      }]
    });
    routerCreator.createRouter(routerInstance);

    const wrappedCallback = promiseResponse.wrap.firstCall.args[0];

    const req = { path: 'foo' };
    const res = { end: sinon.stub() };
    const next = sinon.stub();

    wrappedCallback(req, res, next);

    expect(routerInstance.doThing).to.have.been.calledWithExactly(req, res, next);
  });

  it('should wrap the method call, then call router.get() when a GET method is defined', () => {
    registryContainsMethod('/foo', 'get');

    routerCreator.createRouter(new RouterClass());

    expect(router.get).to.have.been.calledWithExactly('/foo', wrappedCall);
  });

  it('should wrap the method call, then call router.post() when a POST method is defined', () => {
    registryContainsMethod('/foo', 'post');

    routerCreator.createRouter(new RouterClass());

    expect(router.post).to.have.been.calledWithExactly('/foo', wrappedCall);
  });

  it('should wrap the method call, then call router.post() when a PATCH method is defined', () => {
    registryContainsMethod('/foo', 'patch');

    routerCreator.createRouter(new RouterClass());

    expect(router.patch).to.have.been.calledWithExactly('/foo', wrappedCall);
  });

  it('should wrap the method call, then call router.post() when a DELETE method is defined', () => {
    registryContainsMethod('/foo', 'delete');

    routerCreator.createRouter(new RouterClass());

    expect(router.delete).to.have.been.calledWithExactly('/foo', wrappedCall);
  });

  it('should wrap the method call, then call router.post() when a PUT method is defined', () => {
    registryContainsMethod('/foo', 'put');

    routerCreator.createRouter(new RouterClass());

    expect(router.put).to.have.been.calledWithExactly('/foo', wrappedCall);
  });

  it('should wrap the method call, then call router.post() when a OPTIONS method is defined', () => {
    registryContainsMethod('/foo', 'options');

    routerCreator.createRouter(new RouterClass());

    expect(router.options).to.have.been.calledWithExactly('/foo', wrappedCall);
  });

  it('should prefix the method call with the bodyParser if a GET method is defined as bodyParsed', () => {
    const methodName = 'parsedMethod';
    registryContainsMethod('/foo', 'get', methodName);
    registryContainsBodyParsed(methodName);

    routerCreator.createRouter(new RouterClass());

    expect(router.get).to.have.been.calledWithExactly('/foo', sinon.match.func, wrappedCall);
  });

  it('should prefix the method call with the bodyParser if a POST method is defined as bodyParsed', () => {
    const methodName = 'parsedMethod';
    registryContainsMethod('/foo', 'post', methodName);
    registryContainsBodyParsed(methodName);

    routerCreator.createRouter(new RouterClass());

    expect(router.post).to.have.been.calledWithExactly('/foo', sinon.match.func, wrappedCall);
  });

  it('should prefix the method call with the bodyParser if a PATCH method is defined as bodyParsed', () => {
    const methodName = 'parsedMethod';
    registryContainsMethod('/foo', 'patch', methodName);
    registryContainsBodyParsed(methodName);

    routerCreator.createRouter(new RouterClass());

    expect(router.patch).to.have.been.calledWithExactly('/foo', sinon.match.func, wrappedCall);
  });

  it('should prefix the method call with the bodyParser if a DELETE method is defined as bodyParsed', () => {
    const methodName = 'parsedMethod';
    registryContainsMethod('/foo', 'delete', methodName);
    registryContainsBodyParsed(methodName);

    routerCreator.createRouter(new RouterClass());

    expect(router.delete).to.have.been.calledWithExactly('/foo', sinon.match.func, wrappedCall);
  });

  it('should prefix the method call with the bodyParser if a PUT method is defined as bodyParsed', () => {
    const methodName = 'parsedMethod';
    registryContainsMethod('/foo', 'put', methodName);
    registryContainsBodyParsed(methodName);

    routerCreator.createRouter(new RouterClass());

    expect(router.put).to.have.been.calledWithExactly('/foo', sinon.match.func, wrappedCall);
  });

  it('should prefix the method call with the bodyParser if a OPTIONS method is defined as bodyParsed', () => {
    const methodName = 'parsedMethod';
    registryContainsMethod('/foo', 'options', methodName);
    registryContainsBodyParsed(methodName);

    routerCreator.createRouter(new RouterClass());

    expect(router.options).to.have.been.calledWithExactly('/foo', sinon.match.func, wrappedCall);
  });

  it('should call router.use() with the property itself when the UseType is MIDDLEWARE_FUNCTION', () => {
    class TestRouterClass {
      public routerProp: any;
    }
    const instance = new TestRouterClass();
    const middlewareFunction = sinon.stub();
    instance.routerProp = middlewareFunction;

    registryContainsUse(UseType.MIDDLEWARE_FUNCTION, 'routerProp', '/foo');

    routerCreator.createRouter(instance);

    expect(router.use).to.have.been.calledWithExactly('/foo', sinon.match.func);
    router.use.firstCall.args[1](); // Ensure the function argument is our middleware function
    expect(middlewareFunction).to.have.been.calledOnce;
  });

  it('should call router.use() with the result of calling the property itself when the UseType is GETTER', () => {
    class TestRouterClass {
      public routerProp: any;
    }
    const instance = new TestRouterClass();
    const middlewareFunction = sinon.stub();
    const getterFunction = sinon.stub().returns(middlewareFunction);
    instance.routerProp = getterFunction;

    registryContainsUse(UseType.GETTER, 'routerProp', '/foo');

    routerCreator.createRouter(instance);

    expect(router.use).to.have.been.calledWithExactly('/foo', middlewareFunction);
    expect(getterFunction).to.have.been.calledWithExactly();
  });

  it.skip('should test the ROUTER subtype'); // TODO
  it.skip('should test the Authenticated method'); // TODO
  it.skip('should run an integration test with few mocks'); // TODO
});
