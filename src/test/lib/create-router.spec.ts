import * as express from 'express';
import * as request from 'supertest-as-promised';

import {Get, Post, Put, Patch, Options, Delete, BodyParsed, Middleware, createRouter, Response} from '../../lib';
import {UseType} from '../../lib/decorators.interfaces';
import {Use} from '../../lib/use.decorator';

class TestRouter {
  @Get('/profile')
  public getProfile(): Promise<Response> {
    return Response.resolve({
      username: 'user'
    });
  }

  @Post('/profile')
  public postProfile(): Promise<Response> {
    return Response.resolve({
      username: 'newUser'
    });
  }

  @Put('/profile')
  public putProfile(): Promise<Response> {
    return Response.resolve({
      username: 'putUser'
    });
  }

  @Patch('/profile')
  public patchProfile(): Promise<Response> {
    return Response.resolve({
      username: 'patchedUser'
    });
  }

  @Delete('/profile')
  public deleteProfile(): Promise<Response> {
    return Response.resolve(204);
  }

  @Options('/profile')
  public optionsProfile(req: express.Request, res: express.Response): void {
    res.status(200);
    res.header('Allow', 'Anything');
    res.end();
  }

  @Get('/profile/head')
  public headProfile(req: express.Request, res: express.Response): void {
    res.status(200);
    res.header('X-Result', 'Success');
    res.send('foo');
    res.end();
  }

  @Get('/profile-by-id/:profileId')
  public getProfilyById(req: express.Request): Promise<Response> {
    const profileId = req.params['profileId'];
    const param = req.query['extraParam'] || 'default-param';
    return Response.resolve({
      id: profileId,
      param: param
    });
  }

  @BodyParsed()
  @Post('/update-profile')
  public updateProfile(req: express.Request, res: express.Response): Promise<Response> {
    const data = req.body;
    return Response.resolve({
      bodyData: data
    });
  }

  @Post('/error-500')
  public error500(): Promise<Response> {
    return Response.reject(500);
  }

  @Middleware((req: express.Request, res: express.Response, next: express.NextFunction) => {
    (req as any).middlewareRun = 'firstMiddleware';
    next();
  })
  @Middleware((req: express.Request, res: express.Response, next: express.NextFunction) => {
    (req as any).middlewareRun += ' secondMiddleware';
    next();
  })
  @Get('/middleware')
  public runWithMiddleware(req: express.Request, res: express.Response): Promise<Response> {
    return Response.resolve((req as any).middlewareRun);
  }

  @Get('/duplicate-endpoint')
  @Get('/duplicate-endpoint-2')
  @Get(['/duplicate-endpoint-3', '/duplicate-endpoint-4'])
  @Post('/duplicate-endpoint-5')
  public duplicateEndpoint(): Promise<Response> {
    return Response.resolve('yes');
  }

  @Use('/status', UseType.MIDDLEWARE_FUNCTION)
  public addStatusHeaders(req: express.Request, res: express.Response, next: express.NextFunction): void {
    res.header('X-Status', 'UP');
    next();
  }

  @Use('/status', UseType.GETTER)
  public getStatus(): express.RequestHandler {
    return (req: express.Request, res: express.Response): void => {
      res.send('UP').end();
    }
  }

  @Use('/status', UseType.MIDDLEWARE_FUNCTION)
  public addStatusHeadersUnexpected(req: express.Request, res: express.Response, next: express.NextFunction): void {
    res.status(418).end();
  }

  @Use('/details', UseType.ROUTER)
  public childRouter: ChildRouter = new ChildRouter();
}

class ChildRouter {

}

describe('createRouter()', () => {
  let router: TestRouter,
    app: express.Application;

  beforeEach(() => {
    router = new TestRouter();
    app = express();
    app.use(createRouter(router));
  });

  it('should call through GET requests for @Get() methods', () => {
    return request(app)
      .get('/profile')
      .expect(200)
      .expect({
        username: 'user'
      });
  });

  it('should call through POST requests for @Post() methods', () => {
    return request(app)
      .post('/profile')
      .expect(200)
      .expect({
        username: 'newUser'
      });
  });

  it('should call through PUT requests for @Put() methods', () => {
    return request(app)
      .put('/profile')
      .expect(200)
      .expect({
        username: 'putUser'
      });
  });

  it('should call through PATCH requests for @Patch() methods', () => {
    return request(app)
      .patch('/profile')
      .expect(200)
      .expect({
        username: 'patchedUser'
      });
  });

  it('should call through DELETE requests for @Delete() methods', () => {
    return request(app)
      .delete('/profile')
      .expect(204);
  });

  it('should call through OPTIONS requests for @Options() methods', () => {
    return request(app)
      .options('/profile')
      .expect(200)
      .expect('Allow', 'Anything');
  });

  it('should call through HEAD requests for @Get() methods', () => {
    return request(app)
      .head('/profile/head')
      .expect(200)
      .expect('X-Result', 'Success');
  });

  it('should pass URL params and query params correctly to @Get() methods', () => {
    return request(app)
      .get('/profile-by-id/profileid?extraParam=foo')
      .expect(200)
      .expect({
        id: 'profileid',
        param: 'foo'
      });
  });

  it('should correctly leave out missing query parameters in queries to @Get() methods', () => {
    return request(app)
      .get('/profile-by-id/profileid')
      .expect(200)
      .expect({
        id: 'profileid',
        param: 'default-param'
      });
  });

  it('should return a 404 when a URL parameter is missing', () => {
    return request(app)
      .get('/profile-by-id')
      .expect(404);
  });

  it('should pass the parsed body to POST requests', () => {
    return request(app)
      .post('/update-profile')
      .send({
        name: 'foo',
        age: 'bar'
      })
      .expect(200)
      .expect({
        bodyData: {
          name: 'foo',
          age: 'bar'
        }
      });
  });

  it('should throw the error code provided by the endpoint', () => {
    return request(app)
      .post('/error-500')
      .expect(500);
  });

  it('should run middleware in the declared order', () => {
    return request(app)
      .get('/middleware')
      .expect(200)
      .expect('firstMiddleware secondMiddleware');
  });

  it('should map all the routes when multiple routes map to the same endpoint', () => {
    const server = request(app);
    return Promise.all([
      server.get('/duplicate-endpoint').expect(200).expect('yes'),
      server.get('/duplicate-endpoint-2').expect(200).expect('yes'),
      server.get('/duplicate-endpoint-3').expect(200).expect('yes'),
      server.get('/duplicate-endpoint-4').expect(200).expect('yes'),
      server.post('/duplicate-endpoint-5').expect(200).expect('yes')
    ]);
  });

  it.skip('should bind the result of the getter for UseType.GETTER to @Use definitions', () => {
    return request(app)
      .get('/status')
      .expect(200)
      .expect('UP');
  });

  it.skip('should bind the function as a middleware for UseType.MIDDLEWARE_FUNCTION on @Use definitions', () => {
    return request(app)
      .get('/status')
      .expect(200)
      .expect('X-Status', 'UP');
  });

  it.skip('should not bind the function as a middleware for UseType.MIDDLEWARE_FUNCTION on @Use definitions where the method is after the endpoint', () => {
    return request(app)
      .get('/status')
      .expect(200);
  });

  // TODO when having multiple functions, they should be done in source order; but when you get multiple decorators
  // on a single function, they should be reversed (because they will evaluate the other way round).
});
