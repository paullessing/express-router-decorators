import {RouterRegistry} from './router.registry';
import {Clazz} from './decorators.interfaces';

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
export function Authenticated(): MethodDecorator & PropertyDecorator {
  return function(clazz: Clazz, propertyName: string | symbol): void {
    RouterRegistry.getInstance().addAuthenticated(clazz, propertyName);
  };
}
