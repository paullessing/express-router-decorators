import * as express from 'express';

import {Middleware} from '../middleware.decorator';

export const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
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
export function Authenticated(): MethodDecorator & PropertyDecorator {
  return Middleware(authenticate);
}
