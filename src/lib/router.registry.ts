import * as express from 'express';

import {
  RouterDecoratorDefinitions, HttpVerbDefinition, PathArgument, EndpointDefinitionType, Clazz,
  UseDefinition, UseType, HttpVerb
} from './decorators.interfaces';

const EMPTY_ANNOTATIONS: RouterDecoratorDefinitions = {
  middleware: [],
  endpoints: []
};

interface AnnotationsByClass {
  clazz: Clazz;
  annotations: RouterDecoratorDefinitions;
}

export class RouterRegistry {
  private static instance: RouterRegistry;

  private annotationsForAllClasses: AnnotationsByClass[];

  constructor() {
    this.annotationsForAllClasses = [];
  }

  public static getInstance(): RouterRegistry {
    if (!RouterRegistry.instance) {
      RouterRegistry.instance = new RouterRegistry();
    }
    return RouterRegistry.instance;
  }

  public getDefinitions(constructor: Function): RouterDecoratorDefinitions {
    const constructorAnnotations = this.findAnnotations(constructor) || EMPTY_ANNOTATIONS;
    const prototypeAnnotations = this.findAnnotations(constructor.prototype) || EMPTY_ANNOTATIONS;

    return {
      middleware: [].concat(constructorAnnotations.middleware, prototypeAnnotations.middleware),
      endpoints: [].concat(constructorAnnotations.endpoints, prototypeAnnotations.endpoints)
    };
  }

  public addMethod(clazz: Clazz, methodName: string | symbol, httpVerb: HttpVerb, path: PathArgument): void {
    const annotations = this.getOrCreateAnnotations(clazz);
    const methodDefinition: HttpVerbDefinition = {
      httpVerb,
      path,
      methodName
    };
    annotations.endpoints.unshift({
      type: EndpointDefinitionType.METHOD,
      definition: methodDefinition
    });
  }

  public addUse(clazz: Clazz, methodOrPropertyName: string | symbol, useType: UseType, path?: PathArgument): void {
    const annotations = this.getOrCreateAnnotations(clazz);
    const useDefinition: UseDefinition = {
      propertyName: methodOrPropertyName,
      type: useType
    };
    if (path) {
      useDefinition.path = path;
    }
    annotations.endpoints.unshift({
      type: EndpointDefinitionType.USE,
      definition: useDefinition
    });
  }

  public addMiddleware(clazz: Clazz, methodOrPropertyName: string | symbol, middleware: express.RequestHandler): void {
    const annotations = this.getOrCreateAnnotations(clazz);
    annotations.middleware.unshift({
      propertyName: methodOrPropertyName,
      middleware
    });
  }

  private findAnnotations(clazz: Clazz): RouterDecoratorDefinitions | null {
    for (let i = 0; i < this.annotationsForAllClasses.length; i++) {
      if (this.annotationsForAllClasses[i].clazz === clazz) {
        return this.annotationsForAllClasses[i].annotations;
      }
    }
    return null;
  }

  private getOrCreateAnnotations(clazz: Clazz): RouterDecoratorDefinitions {
    let annotationsForThisClass = this.findAnnotations(clazz);
    if (!annotationsForThisClass) {
      annotationsForThisClass = {
        middleware: [],
        endpoints: []
      };
      this.annotationsForAllClasses.push({
        clazz,
        annotations: annotationsForThisClass
      });
    }
    return annotationsForThisClass;
  }
}
