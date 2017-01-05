"use strict";
const bodyParser = require("body-parser");
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
        const methodDecoratorDefinitions = routerDecoratorDefinitions && routerDecoratorDefinitions.methods || [];
        methodDecoratorDefinitions.forEach((typeDefinition) => {
            switch (typeDefinition.type) {
                case decorators_interfaces_1.DecoratorDefinitionType.METHOD:
                    this.addHttpVerb(classInstance, router, routerDecoratorDefinitions, typeDefinition.definition);
                    break;
                case decorators_interfaces_1.DecoratorDefinitionType.USE:
                    this.addUse(classInstance, router, routerDecoratorDefinitions, typeDefinition.definition);
                    break;
                default:
                    throw new Error('Encountered unexpected definition type ' + typeDefinition.type);
            }
        });
        return router;
    }
    addHttpVerb(classInstance, router, annotations, routeDefn) {
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
    addUse(classInstance, router, annotations, useDefn) {
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
        const middlewares = [];
        if (this.isBodyParsed(propertyName, annotations)) {
            middlewares.push(bodyParser);
        }
        if (this.isAuthenticationRequired(propertyName, annotations)) {
            middlewares.push((req, res, next) => {
                if (!req.headers['authorization']) {
                    res.status(401).send('Unauthenticated');
                    res.end();
                }
                else {
                    next();
                }
            });
        }
        return middlewares;
    }
    isBodyParsed(propertyName, annotations) {
        if (!annotations || !annotations.bodyParsed) {
            return false;
        }
        for (let i = 0; i < annotations.bodyParsed.length; i++) {
            if (propertyName === annotations.bodyParsed[i].propertyName) {
                return true;
            }
        }
        return false;
    }
    isAuthenticationRequired(propertyName, annotations) {
        if (!annotations || !annotations.authenticated) {
            return false;
        }
        for (let i = 0; i < annotations.authenticated.length; i++) {
            if (propertyName === annotations.authenticated[i].propertyName) {
                return true;
            }
        }
        return false;
    }
}
exports.RouterCreator = RouterCreator;
