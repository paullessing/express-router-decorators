import {expect} from 'chai';
import * as sinon from 'sinon';

import {RouterRegistry} from '../../lib/router.registry';
import {EndpointDefinitionType, UseType} from '../../lib/decorators.interfaces';

describe('RouterRegistry', () => {
  let registry: RouterRegistry;

  class TestClass {} // We don't need actual properties on this class as all the properties are resolved by name

  beforeEach(() => {
    registry = new RouterRegistry();
  });

  it('should return empty definitions for a class that has none', () => {
    const definitions = registry.getDefinitions(TestClass);

    expect(definitions).not.to.be.undefined;
    expect(definitions.middleware).to.deep.equal([]);
    expect(definitions.endpoints).to.deep.equal([]);
  });

  //=============
  // @Middleware
  //=============

  it('should return middleware definitions when they\'ve been added for a method or property', () => {
    const middleware = sinon.stub();
    registry.addMiddleware(TestClass, 'parsedMethod', middleware);

    const definitions = registry.getDefinitions(TestClass);
    expect(definitions.middleware).to.deep.equal([
      {
        propertyName: 'parsedMethod',
        middleware: middleware
      }
    ]);
  });

  it('should return multiple middleware definitions in the right order when they\'ve been added for methods', () => {
    const middleware1 = sinon.stub();
    const middleware2 = sinon.stub();
    const middleware3 = sinon.stub();
    // The system will process decorators in reverse order of source declaration
    registry.addMiddleware(TestClass, 'method1', middleware3);
    registry.addMiddleware(TestClass, 'method2', middleware2);
    registry.addMiddleware(TestClass, 'method1', middleware1);

    const definitions = registry.getDefinitions(TestClass);
    expect(definitions.middleware).to.deep.equal([
      { propertyName: 'method1', middleware: middleware1 },
      { propertyName: 'method2', middleware: middleware2 },
      { propertyName: 'method1', middleware: middleware3 }
    ]);
  });

  it('should return middleware definitions only for the requested class', () => {
    class OtherClass {}

    registry.addMiddleware(OtherClass, 'method', sinon.stub());

    const definitions = registry.getDefinitions(TestClass);
    expect(definitions.middleware).to.be.empty;
  });

  it('should return middleware definitions even when they were added for the class prototype (e.g. for static members)', () => {
    const middleware1 = sinon.stub();
    const middleware2 = sinon.stub();
    registry.addMiddleware(TestClass, 'instanceMethod', middleware1);
    registry.addMiddleware(TestClass.prototype, 'staticMethod', middleware2);

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.middleware).to.deep.equal([
      { propertyName: 'instanceMethod', middleware: middleware1 },
      { propertyName: 'staticMethod', middleware: middleware2 }
    ]);
  });

  //=================
  // @Get, @Post,...
  //=================

  it('should return method definitions only for the requested class', () => {
    class OtherClass {}

    registry.addMethod(OtherClass, 'method', 'get', '/foo');

    const definitions = registry.getDefinitions(TestClass);
    expect(definitions.endpoints).to.be.empty;
  });

  it('should return method definitions with the correct method name, HTTP verb, and path', () => {
    registry.addMethod(TestClass, 'method', 'get', '/foo');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.endpoints).to.deep.equal([{
      type: EndpointDefinitionType.METHOD,
      definition: {
        httpVerb: 'get',
        path: '/foo',
        methodName: 'method'
      }
    }]);
  });

  it('should return method definitions with the correct method name, HTTP verb, and path array', () => {
    registry.addMethod(TestClass, 'method', 'post', ['/foo', '/bar']);

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.endpoints).to.deep.equal([{
      type: EndpointDefinitionType.METHOD,
      definition: {
        httpVerb: 'post',
        path: ['/foo', '/bar'],
        methodName: 'method'
      }
    }]);
  });

  it('should return multiple method definitions in the right order', () => {
    // System processes decorators in reverse order of source declaration
    registry.addMethod(TestClass, 'getDelete', 'delete', '/del');
    registry.addMethod(TestClass, 'getPost', 'post', '/bar');
    registry.addMethod(TestClass, 'getGet', 'get', '/foo');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.endpoints).to.deep.equal([{
      type: EndpointDefinitionType.METHOD,
      definition: {
        httpVerb: 'get',
        path: '/foo',
        methodName: 'getGet'
      }
    }, {
      type: EndpointDefinitionType.METHOD,
      definition: {
        httpVerb: 'post',
        path: '/bar',
        methodName: 'getPost'
      }
    }, {
      type: EndpointDefinitionType.METHOD,
      definition: {
        httpVerb: 'delete',
        path: '/del',
        methodName: 'getDelete'
      }
    }]);
  });

  it('should return method definitions even when they are static', () => {
    registry.addMethod(TestClass, 'instanceMethod', 'get', '/foo');
    registry.addMethod(TestClass.prototype, 'staticMethod', 'post', '/bar');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.endpoints).to.deep.equal([{
      type: EndpointDefinitionType.METHOD,
      definition: {
        httpVerb: 'get',
        path: '/foo',
        methodName: 'instanceMethod'
      }
    }, {
      type: EndpointDefinitionType.METHOD,
      definition: {
        httpVerb: 'post',
        path: '/bar',
        methodName: 'staticMethod'
      }
    }]);
  });

  it('should return method definitions even when they refer to the same method', () => {
    registry.addMethod(TestClass, 'getMethod', 'get', '/get2');
    registry.addMethod(TestClass, 'getMethod', 'get', '/get1');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.endpoints).to.deep.equal([{
      type: EndpointDefinitionType.METHOD,
      definition: {
        httpVerb: 'get',
        path: '/get1',
        methodName: 'getMethod'
      }
    }, {
      type: EndpointDefinitionType.METHOD,
      definition: {
        httpVerb: 'get',
        path: '/get2',
        methodName: 'getMethod'
      }
    }]);
  });

  it('should return use definitions only for the requested class', () => {
    class OtherClass {}

    registry.addUse(OtherClass, 'method', UseType.MIDDLEWARE_FUNCTION, '/foo');

    const definitions = registry.getDefinitions(TestClass);
    expect(definitions.endpoints).to.be.empty;
  });

  it('should return use definitions with the correct method name, use type, and path', () => {
    registry.addUse(TestClass, 'method', UseType.MIDDLEWARE_FUNCTION, '/foo');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.endpoints).to.deep.equal([{
      type: EndpointDefinitionType.USE,
      definition: {
        type: UseType.MIDDLEWARE_FUNCTION,
        propertyName: 'method',
        path: '/foo'
      }
    }]);
  });

  it('should return use definitions with the correct method name, use type, and path array', () => {
    registry.addUse(TestClass, 'method', UseType.GETTER, ['/foo', '/bar']);

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.endpoints).to.deep.equal([{
      type: EndpointDefinitionType.USE,
      definition: {
        type: UseType.GETTER,
        propertyName: 'method',
        path: ['/foo', '/bar'],
      }
    }]);
  });

  it('should return use definitions with the correct method name, use type, and no path if it wasn\'t set', () => {
    registry.addUse(TestClass, 'method', UseType.ROUTER);

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.endpoints).to.deep.equal([{
      type: EndpointDefinitionType.USE,
      definition: {
        type: UseType.ROUTER,
        propertyName: 'method'
      }
    }]);
  });

  it('should return multiple use definitions in the right order', () => {
    // The system will process decorators in reverse order of source declaration
    registry.addUse(TestClass, 'use3', UseType.MIDDLEWARE_FUNCTION);
    registry.addUse(TestClass, 'use2', UseType.ROUTER);
    registry.addUse(TestClass, 'use1', UseType.GETTER);

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.endpoints).to.deep.equal([{
      type: EndpointDefinitionType.USE,
      definition: {
        propertyName: 'use1',
        type: UseType.GETTER
      }
    }, {
      type: EndpointDefinitionType.USE,
      definition: {
        propertyName: 'use2',
        type: UseType.ROUTER
      }
    }, {
      type: EndpointDefinitionType.USE,
      definition: {
        propertyName: 'use3',
        type: UseType.MIDDLEWARE_FUNCTION
      }
    }]);
  });

  it('should return use definitions even when they are static', () => {
    registry.addUse(TestClass, 'instanceMethod', UseType.GETTER);
    registry.addUse(TestClass.prototype, 'staticMethod', UseType.GETTER);

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.endpoints).to.deep.equal([{
      type: EndpointDefinitionType.USE,
      definition: {
        propertyName: 'instanceMethod',
        type: UseType.GETTER
      }
    }, {
      type: EndpointDefinitionType.USE,
      definition: {
        propertyName: 'staticMethod',
        type: UseType.GETTER
      }
    }]);
  });

  it('should return use definitions even when they refer to the same method', () => {
    // The system will process decorators in reverse order of source declaration
    registry.addUse(TestClass, 'getMethod', UseType.GETTER, '/path2');
    registry.addUse(TestClass, 'getMethod', UseType.GETTER, '/path1');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.endpoints).to.deep.equal([{
      type: EndpointDefinitionType.USE,
      definition: {
        type: UseType.GETTER,
        path: '/path1',
        propertyName: 'getMethod'
      }
    }, {
      type: EndpointDefinitionType.USE,
      definition: {
        type: UseType.GETTER,
        path: '/path2',
        propertyName: 'getMethod'
      }
    }]);
  });

  //================
  // All Decorators
  //================

  it('should return all kinds of properties in the reverse order they were added, with static endpoints at the end', () => {
    const middleware1 = sinon.stub();
    const middleware2 = sinon.stub();
    registry.addMiddleware(TestClass, 'fourthMethod', middleware1);
    registry.addMiddleware(TestClass, 'fourthMethod', middleware2);
    registry.addUse(TestClass, 'fourthMethod', UseType.ROUTER, '/fourthRouter');
    registry.addMethod(TestClass, 'thirdMethod', 'delete', '/deleteThird');
    registry.addMethod(TestClass, 'secondMethod', 'get', '/getSecond');
    registry.addMethod(TestClass, 'secondMethod', 'post', '/postSecond');
    registry.addMiddleware(TestClass, 'secondMethod', middleware2);
    registry.addMiddleware(TestClass, 'secondMethod', middleware1);
    registry.addMethod(TestClass.prototype, 'firstMethodStatic', 'get', '/getFirst');
    registry.addMiddleware(TestClass.prototype, 'firstMethodStatic', middleware2);
    registry.addMiddleware(TestClass.prototype, 'firstMethodStatic', middleware1);

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions).to.deep.equal({
      middleware: [
        { propertyName: 'secondMethod', middleware: middleware1 },
        { propertyName: 'secondMethod', middleware: middleware2 },
        { propertyName: 'fourthMethod', middleware: middleware2 },
        { propertyName: 'fourthMethod', middleware: middleware1 },
        { propertyName: 'firstMethodStatic', middleware: middleware1 },
        { propertyName: 'firstMethodStatic', middleware: middleware2 }
      ],
      endpoints: [{
        type: EndpointDefinitionType.METHOD,
        definition: {
          httpVerb: 'post',
          path: '/postSecond',
          methodName: 'secondMethod'
        }
      }, {
        type: EndpointDefinitionType.METHOD,
        definition: {
          httpVerb: 'get',
          path: '/getSecond',
          methodName: 'secondMethod'
        }
      }, {
        type: EndpointDefinitionType.METHOD,
        definition: {
          httpVerb: 'delete',
          path: '/deleteThird',
          methodName: 'thirdMethod'
        }
      }, {
        type: EndpointDefinitionType.USE,
        definition: {
          type: UseType.ROUTER,
          path: '/fourthRouter',
          propertyName: 'fourthMethod'
        }
      }, {
        type: EndpointDefinitionType.METHOD,
        definition: {
          httpVerb: 'get',
          path: '/getFirst',
          methodName: 'firstMethodStatic'
        }
      }]
    });
  });
});
