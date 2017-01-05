"use strict";
const decorators_interfaces_1 = require("./decorators.interfaces");
const EMPTY_ANNOTATIONS = {
    bodyParsed: [],
    methods: []
};
class RouterRegistry {
    constructor() {
        this.annotationsForAllClasses = [];
    }
    static getInstance() {
        if (!RouterRegistry.instance) {
            RouterRegistry.instance = new RouterRegistry();
        }
        return RouterRegistry.instance;
    }
    getDefinitions(constructor) {
        const constructorAnnotations = this.findAnnotations(constructor) || EMPTY_ANNOTATIONS;
        const prototypeAnnotations = this.findAnnotations(constructor.prototype) || EMPTY_ANNOTATIONS;
        return {
            bodyParsed: [].concat(constructorAnnotations.bodyParsed, prototypeAnnotations.bodyParsed),
            methods: [].concat(constructorAnnotations.methods, prototypeAnnotations.methods)
        };
    }
    addMethod(clazz, methodName, httpVerb, path) {
        const annotations = this.getOrCreateAnnotations(clazz);
        const methodDefinition = {
            httpVerb,
            path,
            methodName
        };
        annotations.methods.push({
            type: decorators_interfaces_1.DecoratorDefinitionType.METHOD,
            definition: methodDefinition
        });
    }
    addUse(clazz, methodOrPropertyName, useType, path) {
        const annotations = this.getOrCreateAnnotations(clazz);
        const useDefinition = {
            propertyName: methodOrPropertyName,
            type: useType
        };
        if (path) {
            useDefinition.path = path;
        }
        annotations.methods.push({
            type: decorators_interfaces_1.DecoratorDefinitionType.USE,
            definition: useDefinition
        });
    }
    addBodyParsed(clazz, methodOrPropertyName) {
        const annotations = this.getOrCreateAnnotations(clazz);
        annotations.bodyParsed.push({
            propertyName: methodOrPropertyName
        });
    }
    findAnnotations(clazz) {
        for (let i = 0; i < this.annotationsForAllClasses.length; i++) {
            if (this.annotationsForAllClasses[i].clazz === clazz) {
                return this.annotationsForAllClasses[i].annotations;
            }
        }
        return null;
    }
    getOrCreateAnnotations(clazz) {
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
exports.RouterRegistry = RouterRegistry;
