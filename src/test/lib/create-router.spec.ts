import {expect} from 'chai';
import * as sinon from 'sinon';
import * as express from 'express';
import * as request from 'supertest-as-promised';

import {Get, Post} from '../../lib';
import {createRouter} from '../../lib/create-router';
import {Response} from '../../lib/promise-response/response';

class TestRouter {
  @Get('/profile')
  public getProfile(req: express.Request, res: express.Response, next: express.NextFunction): Promise<Response> {
    return Response.resolve({
      username: 'user'
    });
  }

  @Post('/profile')
  public postProfile(req: express.Request, res: express.Response, next: express.NextFunction): void {}
}

describe('createRouter', () => {
  let router: TestRouter,
    app: express.Application;

  beforeEach(() => {
    router = new TestRouter();
    app = express();
    app.use(createRouter(router));
  });

  it('should call through GET requests for @Get methods', () => {
    return request(app)
      .get('/profile')
      .expect(200)
      .expect({
        username: 'user'
      });
  });
});
