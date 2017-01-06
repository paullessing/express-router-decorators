"use strict";
const decorators_interfaces_1 = require("./decorators.interfaces");
class RouterCreator {
    constructor(expressRouterFactory, routerRegistry, promiseResponse) {
        this.expressRouterFactory = expressRouterFactory;
        this.routerRegistry = routerRegistry;
        this.promiseResponse = promiseResponse;
    }
    createRouter(classInstance) {
        const routerDecoratorDefinitions = this.routerRegistry.getDefinitions(classInstance.constructor);
        const router = this.expressRouterFactory();
        const endpointDefinitions = routerDecoratorDefinitions && routerDecoratorDefinitions.endpoints || [];
        endpointDefinitions.forEach((endpointDefinition) => {
            switch (endpointDefinition.type) {
                case decorators_interfaces_1.EndpointDefinitionType.METHOD:
                    this.addHttpVerbEndpoint(classInstance, router, routerDecoratorDefinitions, endpointDefinition.definition);
                    break;
                case decorators_interfaces_1.EndpointDefinitionType.USE:
                    this.addUseEndpoint(classInstance, router, routerDecoratorDefinitions, endpointDefinition.definition);
                    break;
                default:
                    throw new Error('Encountered unexpected definition type ' + endpointDefinition.type);
            }
        });
        return router;
    }
    addHttpVerbEndpoint(classInstance, router, annotations, routeDefn) {
        // We will call router.{get|post|...}() later, by calling apply(router, args).
        // This value builds up the args we will use to call this. See https://expressjs.com/en/guide/routing.html
        let httpVerbMethodArgs = [];
        httpVerbMethodArgs.push(routeDefn.path);
        this.getMiddlewares(routeDefn.methodName, annotations).forEach((middleware) => httpVerbMethodArgs.push(middleware));
        const requestHandler = this.promiseResponse.wrap((req, res, next) => {
            return classInstance[routeDefn.methodName].call(classInstance, req, res, next);
        });
        httpVerbMethodArgs.push(requestHandler);
        router[routeDefn.httpVerb].apply(router, httpVerbMethodArgs);
    }
    addUseEndpoint(classInstance, router, annotations, useDefn) {
        // We will call router.use() later, by calling apply(router, args).
        // This value builds up the args we will use to call this. See https://expressjs.com/en/guide/routing.html
        const useArgs = [];
        if (useDefn.path) {
            useArgs.push(useDefn.path);
        }
        this.getMiddlewares(useDefn.propertyName, annotations).forEach((middleware) => useArgs.push(middleware));
        const useProperty = classInstance[useDefn.propertyName];
        switch (useDefn.type) {
            case decorators_interfaces_1.UseType.GETTER:
                useArgs.push(useProperty.call(classInstance));
                break;
            case decorators_interfaces_1.UseType.MIDDLEWARE_FUNCTION:
                useArgs.push(useProperty.bind(classInstance));
                break;
            case decorators_interfaces_1.UseType.ROUTER:
                useArgs.push(this.createRouter(useProperty));
                break;
            default:
                throw new Error(`Unknown UseType for property "${useDefn.propertyName} on path ${useDefn.path}`);
        }
        router.use.apply(router, useArgs);
    }
    getMiddlewares(propertyName, annotations) {
        return annotations.middleware
            .filter((middleware) => middleware.propertyName === propertyName)
            .map((middleware) => middleware.middleware);
    }
}
exports.RouterCreator = RouterCreator;
