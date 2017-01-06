import * as bodyParser from 'body-parser';

import {Middleware} from '../middleware.decorator';

export const bodyParserJson = bodyParser.json();

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
  return Middleware(bodyParserJson);
}
