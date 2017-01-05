import {PathArgument, UseType, Clazz} from './decorators.interfaces';
import {RouterRegistry} from './router.registry';

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
export function Use(pathOrType?: PathArgument | UseType, useType?: UseType): PropertyDecorator & MethodDecorator {
  let path: PathArgument;
  if (typeof useType === 'undefined' && typeof pathOrType === 'number' && !Array.isArray(pathOrType)) {
    useType = pathOrType as UseType;
  } else {
    path = pathOrType as PathArgument;
  }
  if (typeof useType === 'undefined') {
    useType = UseType.MIDDLEWARE_FUNCTION;
  }

  return function(clazz: Clazz, propertyName: string | symbol): void {
    RouterRegistry.getInstance().addUse(clazz, propertyName, useType, path);
  };
}
