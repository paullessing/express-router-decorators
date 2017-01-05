import {
  RouterDecoratorDefinitions, HttpVerbDefinition, PathArgument, DecoratorDefinitionType, Clazz,
  UseDefinition, UseType, HttpVerb
} from './decorators.interfaces';

const EMPTY_ANNOTATIONS: RouterDecoratorDefinitions = {
  bodyParsed: [],
  methods: []
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
      bodyParsed: [].concat(constructorAnnotations.bodyParsed, prototypeAnnotations.bodyParsed),
      methods: [].concat(constructorAnnotations.methods, prototypeAnnotations.methods)
    };
  }

  public addMethod(clazz: Clazz, methodName: string | symbol, httpVerb: HttpVerb, path: PathArgument): void {
    const annotations = this.getOrCreateAnnotations(clazz);
    const methodDefinition: HttpVerbDefinition = {
      httpVerb,
      path,
      methodName
    };
    annotations.methods.push({
      type: DecoratorDefinitionType.METHOD,
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
    annotations.methods.push({
      type: DecoratorDefinitionType.USE,
      definition: useDefinition
    });
  }

  public addBodyParsed(clazz: Clazz, methodOrPropertyName: string | symbol): void {
    const annotations = this.getOrCreateAnnotations(clazz);
    annotations.bodyParsed.push({
      propertyName: methodOrPropertyName
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
        bodyParsed: [],
        methods: []
      };
      this.annotationsForAllClasses.push({
        clazz,
        annotations: annotationsForThisClass
      });
    }
    return annotationsForThisClass;
  }
}
