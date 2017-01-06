import * as express from 'express';

import {Clazz} from './decorators.interfaces';
import {RouterRegistry} from './router.registry';

export function Middleware(middleware: express.RequestHandler): MethodDecorator & PropertyDecorator {
  return (clazz: Clazz, propertyName: string | symbol): void => {
    RouterRegistry.getInstance().addMiddleware(clazz, propertyName, middleware);
  };
}
