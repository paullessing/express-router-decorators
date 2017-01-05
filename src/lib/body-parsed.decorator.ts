import {RouterRegistry} from './router.registry';
import {Clazz} from './decorators.interfaces';

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
export function BodyParsed(): MethodDecorator & PropertyDecorator {
  return (clazz: Clazz, propertyName: string | symbol): void => {
    RouterRegistry.getInstance().addBodyParsed(clazz, propertyName);
  };
}
