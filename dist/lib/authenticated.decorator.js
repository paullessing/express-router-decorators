"use strict";
const router_registry_1 = require("./router.registry");
/**
 * Method decorator for enforcing that a route needs to have an `authentication` HTTP header.
 * Will return 401 if not present.
 * Usage:
 * <pre><code>
 *   @Get('/')
 *   @Authenticated()
 *   public getRoot(req: express.Request, res: express.Response): Promise<any> {
 *   }
 * </code></pre>
 */
function Authenticated() {
    return function (clazz, propertyName) {
        router_registry_1.RouterRegistry.getInstance().addAuthenticated(clazz, propertyName);
    };
}
exports.Authenticated = Authenticated;
