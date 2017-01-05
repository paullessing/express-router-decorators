"use strict";
const decorators_interfaces_1 = require("./decorators.interfaces");
const router_registry_1 = require("./router.registry");
/**
 * Method decorator to indicate that a given function is a middleware function.
 * If `create: true` is passed, the function is called to create the middleware instead.
 * The path argument is optional.
 *
 * Usage:
 * <pre><code>
 *   @Use('/')
 *   public handleRequest(req: express.Request, res: express.Response, next: NextFunction): Promise<any> {
 *   }
 *
 *   @Use({ create: true })
 *   public getMiddleware(): ResponseRequestHandler {
 *     return (req, res, next) => {
 *       ...
 *     };
 *   }
 * </code></pre>
 */
function Use(pathOrType, useType) {
    let path;
    if (typeof useType === 'undefined' && typeof pathOrType === 'number' && !Array.isArray(pathOrType)) {
        useType = pathOrType;
    }
    else {
        path = pathOrType;
    }
    if (typeof useType === 'undefined') {
        useType = decorators_interfaces_1.UseType.MIDDLEWARE_FUNCTION;
    }
    return function (clazz, propertyName) {
        router_registry_1.RouterRegistry.getInstance().addUse(clazz, propertyName, useType, path);
    };
}
exports.Use = Use;
