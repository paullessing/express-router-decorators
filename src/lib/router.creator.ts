import * as express from 'express';
import * as bodyParser from 'body-parser';

import {RouterRegistry} from './router.registry';
import {
  RouterDecoratorDefinitions,
  MethodDecoratorDefinition,
  DecoratorDefinitionType,
  HttpVerbDefinition,
  UseDefinition,
  UseType
} from './decorators.interfaces';
import {PromiseResponseWrapper} from './promise-response/promise-response.wrapper';
import {Response} from './promise-response/response';

export interface ExpressRouterFactory {
  (): express.Router;
}

export class RouterCreator {
  public constructor(
    private expressRouterFactory: ExpressRouterFactory,
    private routerRegistry: RouterRegistry,
    private promiseResponse: PromiseResponseWrapper
  ) {
  }

  public createRouter(classInstance: any): express.Router {
    const routerDecoratorDefinitions = this.routerRegistry.getDefinitions(classInstance.constructor);
    const router = this.expressRouterFactory();

    const methodDecoratorDefinitions: MethodDecoratorDefinition[] = routerDecoratorDefinitions && routerDecoratorDefinitions.methods || [];

    methodDecoratorDefinitions.forEach((typeDefinition: MethodDecoratorDefinition) => {
      switch (typeDefinition.type) {
        case DecoratorDefinitionType.METHOD:
          this.addHttpVerb(classInstance, router, routerDecoratorDefinitions, typeDefinition.definition as HttpVerbDefinition);
          break;
        case DecoratorDefinitionType.USE:
          this.addUse(classInstance, router, routerDecoratorDefinitions, typeDefinition.definition as UseDefinition);
          break;
        default:
          throw new Error('Encountered unexpected definition type ' + typeDefinition.type);
      }
    });

    return router;
  }

  private addHttpVerb(classInstance: any, router: express.Router, annotations: RouterDecoratorDefinitions, routeDefn: HttpVerbDefinition): void {
    // We will call router.{get|post|...}() later, by calling apply(router, args).
    // This value builds up the args we will use to call this. See https://expressjs.com/en/guide/routing.html
    let httpVerbMethodArgs: any[] = [];

    httpVerbMethodArgs.push(routeDefn.path);

    this.getMiddlewares(routeDefn.methodName, annotations).forEach(
      (middleware: express.RequestHandler) => httpVerbMethodArgs.push(middleware)
    );

    const requestHandler = this.promiseResponse.wrap(
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        return classInstance[routeDefn.methodName].call(classInstance, req, res, next) as Promise<Response>;
      });
    httpVerbMethodArgs.push(requestHandler);

    router[routeDefn.httpVerb].apply(router, httpVerbMethodArgs);
  }

  private addUse(classInstance: any, router: express.Router, annotations: RouterDecoratorDefinitions, useDefn: UseDefinition): void {
    // We will call router.use() later, by calling apply(router, args).
    // This value builds up the args we will use to call this. See https://expressjs.com/en/guide/routing.html
    const useArgs: any[] = [];

    if (useDefn.path) {
      useArgs.push(useDefn.path);
    }

    this.getMiddlewares(useDefn.propertyName, annotations).forEach(
      (middleware: express.RequestHandler) => useArgs.push(middleware)
    );

    const useProperty = classInstance[useDefn.propertyName];
    switch (useDefn.type) {
      case UseType.GETTER:
        useArgs.push(useProperty.call(classInstance));
        break;
      case UseType.MIDDLEWARE_FUNCTION:
        useArgs.push(useProperty.bind(classInstance));
        break;
      case UseType.ROUTER:
        useArgs.push(this.createRouter(useProperty));
        break;
      default:
        throw new Error(`Unknown UseType for property "${useDefn.propertyName} on path ${useDefn.path}`);
    }

    router.use.apply(router, useArgs);
  }

  private getMiddlewares(propertyName: string | symbol, annotations: RouterDecoratorDefinitions): express.RequestHandler[] {
    const middlewares = [];

    if (this.isBodyParsed(propertyName, annotations)) {
      middlewares.push(bodyParser.json());
    }

    return middlewares;
  }

  private isBodyParsed(propertyName: string | symbol, annotations: RouterDecoratorDefinitions): boolean {
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
}
