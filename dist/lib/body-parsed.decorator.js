"use strict";
const router_registry_1 = require("./router.registry");
/**
 * Method decorator for indicating that a route should have its body parsed using bodyParser.json().
 * Usage:
 * <pre><code>
 *   @Get('/')
 *   @BodyParsed
 *   public getRoot(req: express.Request & ParsedAsJson, res: express.Response): Promise<any> {
 *   }
 * </code></pre>
 */
function BodyParsed() {
    return (clazz, propertyName) => {
        router_registry_1.RouterRegistry.getInstance().addBodyParsed(clazz, propertyName);
    };
}
exports.BodyParsed = BodyParsed;
