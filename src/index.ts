import * as express from 'express';

import {
  Use,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Options,
  RouterCreator,
  RouterRegistry,
  Logger,
  Response,
  PromiseResponseWrapper
} from './lib';

function createRouter(classInstance: any, options?: {
  log?: Logger
}): express.Router {
  const promiseResponseFactory = new PromiseResponseWrapper();
  if (options && options.log) {
    promiseResponseFactory.setLogger(options.log);
  }

  const creator = new RouterCreator(
    () => express.Router(),
    RouterRegistry.getInstance(),
    promiseResponseFactory
  );
  return creator.createRouter(classInstance);
}

export {
  createRouter,
  Use,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Options,
  Response
}
