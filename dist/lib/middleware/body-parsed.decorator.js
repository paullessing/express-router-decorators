"use strict";
const bodyParser = require("body-parser");
const middleware_decorator_1 = require("../middleware.decorator");
exports.bodyParserJson = bodyParser.json();
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
    return middleware_decorator_1.Middleware(exports.bodyParserJson);
}
exports.BodyParsed = BodyParsed;
