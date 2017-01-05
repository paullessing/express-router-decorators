"use strict";
const router_registry_1 = require("./router.registry");
/**
 * Method decorator to indicate this method is supposed to be used as express.METHOD (https://expressjs.com/en/starter/basic-routing.html)
 */
function Method(httpVerb, path) {
    return (clazz, methodName) => {
        router_registry_1.RouterRegistry.getInstance().addMethod(clazz, methodName, httpVerb, path);
    };
}
exports.Method = Method;
/**
 * Method decorator to indicate this method is supposed to be used as a GET method.
 *
 * Usage:
 * <pre><code>
 *   @Get('/')
 *   public getData(req: express.Request & ParsedAsJson, res: express.Response): Promise<any> {
 *   }
 * </code></pre>
 */
function Get(path) {
    return Method('get', path);
}
exports.Get = Get;
/**
 * Method decorator to indicate this method is supposed to be used as a POST method.
 *
 * Usage:
 * <pre><code>
 *   @Post('/submit')
 *   @BodyParsed
 *   public submit(req: express.Request & ParsedAsJson, res: express.Response): Promise<any> {
 *   }
 * </code></pre>
 */
function Post(path) {
    return Method('post', path);
}
exports.Post = Post;
/**
 * Method decorator to indicate this method is supposed to be used as a PUT method.
 *
 * Usage:
 * <pre><code>
 *   @Put('/:id')
 *   public update(req: express.Request, res: express.Response): Promise<any> {
 *   }
 * </code></pre>
 */
function Put(path) {
    return Method('put', path);
}
exports.Put = Put;
/**
 * Method decorator to indicate this method is supposed to be used as a PATCH method.
 *
 * Usage:
 * <pre><code>
 *   @Patch('/:id')
 *   @BodyParsed
 *   public update(req: express.Request & ParsedAsJson, res: express.Response): Promise<any> {
 *   }
 * </code></pre>
 */
function Patch(path) {
    return Method('patch', path);
}
exports.Patch = Patch;
/**
 * Method decorator to indicate this method is supposed to be used as a DELETE method.
 *
 * Usage:
 * <pre><code>
 *   @Delete('/:id')
 *   public remove(req: express.Request, res: express.Response): Promise<any> {
 *   }
 * </code></pre>
 */
function Delete(path) {
    return Method('delete', path);
}
exports.Delete = Delete;
/**
 * Method decorator to indicate this method is supposed to be used as a OPTIONS method.
 *
 * Usage:
 * <pre><code>
 *   @Options('/')
 *   public getOptions(req: express.Request, res: express.Response): Promise<any> {
 *   }
 * </code></pre>
 */
function Options(path) {
    return Method('options', path);
}
exports.Options = Options;
