import {expect} from 'chai';

import {RouterRegistry} from '../../lib/router.registry';
import {DecoratorDefinitionType, UseType} from '../../lib/decorators.interfaces';

describe('RouterRegistry', () => {
  let registry: RouterRegistry;

  class TestClass {} // We don't need actual properties on this class as all the properties are resolved by name

  beforeEach(() => {
    registry = new RouterRegistry();
  });

  it('should return empty definitions for a class that has none', () => {
    const definitions = registry.getDefinitions(TestClass);

    expect(definitions).not.to.be.undefined;
    expect(definitions.authenticated).to.deep.equal([]);
    expect(definitions.bodyParsed).to.deep.equal([]);
    expect(definitions.methods).to.deep.equal([]);
  });

  //=============
  // @BodyParsed
  //=============

  it('should return bodyParsed definitions when they\'ve been added for a class', () => {
    registry.addBodyParsed(TestClass, 'parsedMethod');

    const definitions = registry.getDefinitions(TestClass);
    expect(definitions.bodyParsed).to.deep.equal([
      { propertyName: 'parsedMethod' }
    ]);
  });

  it('should return multiple bodyParsed definitions in the right order when they\'ve been added for a class', () => {
    registry.addBodyParsed(TestClass, 'method1');
    registry.addBodyParsed(TestClass, 'method2');
    registry.addBodyParsed(TestClass, 'method3');

    const definitions = registry.getDefinitions(TestClass);
    expect(definitions.bodyParsed).to.deep.equal([
      { propertyName: 'method1' },
      { propertyName: 'method2' },
      { propertyName: 'method3' }
    ]);
  });

  it('should return bodyParsed definitions only for the requested class', () => {
    class OtherClass {}

    registry.addBodyParsed(OtherClass, 'method');

    const definitions = registry.getDefinitions(TestClass);
    expect(definitions.bodyParsed).to.be.empty;
  });

  it('should return bodyParsed definitions even when they were added for the class prototype (e.g. for static members)', () => {
    registry.addBodyParsed(TestClass, 'instanceMethod');
    registry.addBodyParsed(TestClass.prototype, 'staticMethod');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.bodyParsed).to.deep.equal([
      { propertyName: 'instanceMethod' },
      { propertyName: 'staticMethod' }
    ]);
  });

  //================
  // @Authenticated
  //================

  it('should return authenticated definitions when they\'ve been added for a class', () => {
    registry.addAuthenticated(TestClass, 'parsedMethod');

    const definitions = registry.getDefinitions(TestClass);
    expect(definitions.authenticated).to.deep.equal([
      { propertyName: 'parsedMethod' }
    ]);
  });

  it('should return multiple authenticated definitions in the right order when they\'ve been added for a class', () => {
    registry.addAuthenticated(TestClass, 'method1');
    registry.addAuthenticated(TestClass, 'method2');
    registry.addAuthenticated(TestClass, 'method3');

    const definitions = registry.getDefinitions(TestClass);
    expect(definitions.authenticated).to.deep.equal([
      { propertyName: 'method1' },
      { propertyName: 'method2' },
      { propertyName: 'method3' }
    ]);
  });

  it('should return authenticated definitions only for the requested class', () => {
    class OtherClass {}

    registry.addAuthenticated(OtherClass, 'method');

    const definitions = registry.getDefinitions(TestClass);
    expect(definitions.authenticated).to.be.empty;
  });

  it('should return authenticated definitions even when they were added for the class prototype (e.g. for static members)', () => {
    registry.addAuthenticated(TestClass, 'instanceMethod');
    registry.addAuthenticated(TestClass.prototype, 'staticMethod');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.authenticated).to.deep.equal([
      { propertyName: 'instanceMethod' },
      { propertyName: 'staticMethod' }
    ]);
  });

  //=================
  // @Get, @Post,...
  //=================

  it('should return method definitions only for the requested class', () => {
    class OtherClass {}

    registry.addMethod(OtherClass, 'method', 'get', '/foo');

    const definitions = registry.getDefinitions(TestClass);
    expect(definitions.methods).to.be.empty;
  });

  it('should return method definitions with the correct method name, HTTP verb, and path', () => {
    registry.addMethod(TestClass, 'method', 'get', '/foo');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.methods).to.deep.equal([{
      type: DecoratorDefinitionType.METHOD,
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

    expect(definitions.methods).to.deep.equal([{
      type: DecoratorDefinitionType.METHOD,
      definition: {
        httpVerb: 'post',
        path: ['/foo', '/bar'],
        methodName: 'method'
      }
    }]);
  });

  it('should return multiple method definitions in the right order', () => {
    registry.addMethod(TestClass, 'getGet', 'get', '/foo');
    registry.addMethod(TestClass, 'getPost', 'post', '/bar');
    registry.addMethod(TestClass, 'getDelete', 'delete', '/del');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.methods).to.deep.equal([{
      type: DecoratorDefinitionType.METHOD,
      definition: {
        httpVerb: 'get',
        path: '/foo',
        methodName: 'getGet'
      }
    }, {
      type: DecoratorDefinitionType.METHOD,
      definition: {
        httpVerb: 'post',
        path: '/bar',
        methodName: 'getPost'
      }
    }, {
      type: DecoratorDefinitionType.METHOD,
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

    expect(definitions.methods).to.deep.equal([{
      type: DecoratorDefinitionType.METHOD,
      definition: {
        httpVerb: 'get',
        path: '/foo',
        methodName: 'instanceMethod'
      }
    }, {
      type: DecoratorDefinitionType.METHOD,
      definition: {
        httpVerb: 'post',
        path: '/bar',
        methodName: 'staticMethod'
      }
    }]);
  });

  it('should return method definitions even when they refer to the same method', () => {
    registry.addMethod(TestClass, 'getMethod', 'get', '/get1');
    registry.addMethod(TestClass, 'getMethod', 'get', '/get2');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.methods).to.deep.equal([{
      type: DecoratorDefinitionType.METHOD,
      definition: {
        httpVerb: 'get',
        path: '/get1',
        methodName: 'getMethod'
      }
    }, {
      type: DecoratorDefinitionType.METHOD,
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
    expect(definitions.methods).to.be.empty;
  });

  it('should return use definitions with the correct method name, use type, and path', () => {
    registry.addUse(TestClass, 'method', UseType.MIDDLEWARE_FUNCTION, '/foo');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.methods).to.deep.equal([{
      type: DecoratorDefinitionType.USE,
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

    expect(definitions.methods).to.deep.equal([{
      type: DecoratorDefinitionType.USE,
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

    expect(definitions.methods).to.deep.equal([{
      type: DecoratorDefinitionType.USE,
      definition: {
        type: UseType.ROUTER,
        propertyName: 'method'
      }
    }]);
  });

  it('should return multiple use definitions in the right order', () => {
    registry.addUse(TestClass, 'use1', UseType.GETTER);
    registry.addUse(TestClass, 'use2', UseType.ROUTER);
    registry.addUse(TestClass, 'use3', UseType.MIDDLEWARE_FUNCTION);

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.methods).to.deep.equal([{
      type: DecoratorDefinitionType.USE,
      definition: {
        propertyName: 'use1',
        type: UseType.GETTER
      }
    }, {
      type: DecoratorDefinitionType.USE,
      definition: {
        propertyName: 'use2',
        type: UseType.ROUTER
      }
    }, {
      type: DecoratorDefinitionType.USE,
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

    expect(definitions.methods).to.deep.equal([{
      type: DecoratorDefinitionType.USE,
      definition: {
        propertyName: 'instanceMethod',
        type: UseType.GETTER
      }
    }, {
      type: DecoratorDefinitionType.USE,
      definition: {
        propertyName: 'staticMethod',
        type: UseType.GETTER
      }
    }]);
  });

  it('should return use definitions even when they refer to the same method', () => {
    registry.addUse(TestClass, 'getMethod', UseType.GETTER, '/path1');
    registry.addUse(TestClass, 'getMethod', UseType.GETTER, '/path2');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions.methods).to.deep.equal([{
      type: DecoratorDefinitionType.USE,
      definition: {
        type: UseType.GETTER,
        path: '/path1',
        propertyName: 'getMethod'
      }
    }, {
      type: DecoratorDefinitionType.USE,
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

  it('should return all kinds of properties in the order they were added, with static methods at the end', () => {
    registry.addBodyParsed(TestClass.prototype, 'firstMethodStatic');
    registry.addAuthenticated(TestClass.prototype, 'firstMethodStatic');
    registry.addMethod(TestClass.prototype, 'firstMethodStatic', 'get', '/getFirst');
    registry.addBodyParsed(TestClass, 'secondMethod');
    registry.addAuthenticated(TestClass, 'secondMethod');
    registry.addMethod(TestClass, 'secondMethod', 'post', '/postSecond');
    registry.addMethod(TestClass, 'secondMethod', 'get', '/getSecond');
    registry.addMethod(TestClass, 'thirdMethod', 'delete', '/deleteThird');
    registry.addUse(TestClass, 'fourthMethod', UseType.ROUTER, '/fourthRouter');
    registry.addAuthenticated(TestClass, 'fourthMethod');
    registry.addBodyParsed(TestClass, 'fourthMethod');

    const definitions = registry.getDefinitions(TestClass);

    expect(definitions).to.deep.equal({
      authenticated: [
        { propertyName: 'secondMethod' },
        { propertyName: 'fourthMethod' },
        { propertyName: 'firstMethodStatic' }
      ],
      bodyParsed: [
        { propertyName: 'secondMethod' },
        { propertyName: 'fourthMethod' },
        { propertyName: 'firstMethodStatic' }
      ],
      methods: [{
        type: DecoratorDefinitionType.METHOD,
        definition: {
          httpVerb: 'post',
          path: '/postSecond',
          methodName: 'secondMethod'
        }
      }, {
        type: DecoratorDefinitionType.METHOD,
        definition: {
          httpVerb: 'get',
          path: '/getSecond',
          methodName: 'secondMethod'
        }
      }, {
        type: DecoratorDefinitionType.METHOD,
        definition: {
          httpVerb: 'delete',
          path: '/deleteThird',
          methodName: 'thirdMethod'
        }
      }, {
        type: DecoratorDefinitionType.USE,
        definition: {
          type: UseType.ROUTER,
          path: '/fourthRouter',
          propertyName: 'fourthMethod'
        }
      }, {
        type: DecoratorDefinitionType.METHOD,
        definition: {
          httpVerb: 'get',
          path: '/getFirst',
          methodName: 'firstMethodStatic'
        }
      }]
    });
  });
});
