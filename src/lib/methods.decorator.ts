import {PathArgument, Clazz, HttpVerb} from './decorators.interfaces';
import {RouterRegistry} from './router.registry';

/**
 * Method decorator to indicate this method is supposed to be used as express.METHOD (https://expressjs.com/en/starter/basic-routing.html)
 */
export function Method(httpVerb: HttpVerb, path: PathArgument): MethodDecorator {
  return (clazz: Clazz, methodName: string | symbol): void => {
    RouterRegistry.getInstance().addMethod(clazz, methodName, httpVerb, path);
  };
}

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
export function Get(path: PathArgument): MethodDecorator {
  return Method('get', path);
}

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
export function Post(path: PathArgument): MethodDecorator {
  return Method('post', path);
}

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
export function Put(path: PathArgument): MethodDecorator {
  return Method('put', path);
}

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
export function Patch(path: PathArgument): MethodDecorator {
  return Method('patch', path);
}

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
export function Delete(path: PathArgument): MethodDecorator {
  return Method('delete', path);
}

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
export function Options(path: PathArgument): MethodDecorator {
  return Method('options', path);
}
