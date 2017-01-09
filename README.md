# Express Router Decorators
```
class UserController {
  @Get('/profile/:profileId)
  public getProfile(req: express.Request, res: express.Response, next: express.NextFunction): Promise<Response> {
    return userService.getUser(req.params.profileId)
      .then(user => Response.success(user)); // Wrap the resulting user in a Response object
  }
  
  @Delete('/:userId')
  public deleteUser(req: express.Request): Promise<Response> {
    const userId = req.params.userId;
    return userService.userExists(userId)
      .then(exists => {
        if (exists) {
          return userService.deleteUser(userId);
        } else {
          return Response.reject(404, 'User not found'); // Returns a failed promise with a 404 error code
        }
      })
      .then(() => Response.resolve(204); // In the success case, returns a successful empty promise with a 204 code
  }
}
```
