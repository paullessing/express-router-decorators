"use strict";
const middleware_decorator_1 = require("../middleware.decorator");
exports.authenticate = (req, res, next) => {
    if (!req.headers['authorization']) {
        res.status(401).send('Unauthenticated');
        res.end();
        return;
    }
    next();
};
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
    return middleware_decorator_1.Middleware(exports.authenticate);
}
exports.Authenticated = Authenticated;
