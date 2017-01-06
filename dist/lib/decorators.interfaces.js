"use strict";
/**
 * Determines whether a EndpointDefinition is a Use or Method definition.
 */
var EndpointDefinitionType;
(function (EndpointDefinitionType) {
    EndpointDefinitionType[EndpointDefinitionType["USE"] = 0] = "USE";
    EndpointDefinitionType[EndpointDefinitionType["METHOD"] = 1] = "METHOD";
})(EndpointDefinitionType = exports.EndpointDefinitionType || (exports.EndpointDefinitionType = {}));
/**
 * Different types of usage for the @Use() decorator.
 */
var UseType;
(function (UseType) {
    /**
     * Property or method representing a middleware function (express.RequestHandler). This is the default value.
     * Example:
     * <code><pre>
     *   @Use('/submit', UseType.MIDDLEWARE_FUNCTION)
     *   public submit(req: express.Request, res: express.Response, next: express.NextFunction): void {
     *     // next() should be called somewhere inside this function
     *   }
     *
     *   @Use('/proxy', UseType.MIDDLEWARE_FUNCTION)
     *   public proxy: express.RequestHandler;
     * </pre></code>
     */
    UseType[UseType["MIDDLEWARE_FUNCTION"] = 0] = "MIDDLEWARE_FUNCTION";
    /**
     * Method which will return a middleware function (express.RequestHandler). Must be zero-args.
     * Example:
     * <code><pre>
     *   @Use('/proxy', UseType.GETTER)
     *   public getProxy(): express.RequestHandler {
     *     return this.createProxy();
     *   }
     * </pre></code>
     */
    UseType[UseType["GETTER"] = 1] = "GETTER";
    /**
     * A property containing a whole sub-router which can be loaded using the RouterCreator.
     * Example:
     *
     * <code><pre>
     *   @Use('/restaurant', UseType.ROUTER)
     *   public restaurantRouter: RestaurantRouter;
     * </pre></code>
     */
    UseType[UseType["ROUTER"] = 2] = "ROUTER";
})(UseType = exports.UseType || (exports.UseType = {}));
