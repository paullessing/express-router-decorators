import * as express from 'express';

import {Logger} from './promise-response/logger.interface';
import {PromiseResponseWrapper} from './promise-response/promise-response.wrapper';
import {RouterRegistry} from './router.registry';
import {RouterCreator} from './router.creator';

export function createRouter(classInstance: any, options?: {
  log?: Logger
}): express.Router {
  const promiseResponseWrapper = new PromiseResponseWrapper();
  if (options && options.log) {
    promiseResponseWrapper.setLogger(options.log);
  }

  const creator = new RouterCreator(
    (): express.Router => express.Router(),
    RouterRegistry.getInstance(),
    promiseResponseWrapper
  );
  return creator.createRouter(classInstance);
}
