export type PathArgument = string | RegExp | (string | RegExp)[];
export type Clazz = Function | {};
export type HttpVerb = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

/**
 * Contains all decorator definitions for a router.
 */
export interface RouterDecoratorDefinitions {
  bodyParsed: BodyParsedDecoratorDefinition[];
  methods: MethodDecoratorDefinition[];
}

/**
 * Contains the full definition for a http verb or use definition. These are grouped for simplicity.
 */
export interface MethodDecoratorDefinition {
  type: DecoratorDefinitionType;
  definition: HttpVerbDefinition | UseDefinition;
}

/**
 * Determines whether a MethodDecoratorDefinition is a Use or Method definition.
 */
export enum DecoratorDefinitionType {
  USE,
  METHOD
}

/**
 * Contains the definition of a HTTP Verb method, e.g. @Get or @Post, with the method called on a class, and the matching path and HTTP verb.
 */
export interface HttpVerbDefinition {
  methodName: string | symbol;
  httpVerb: HttpVerb;
  path: PathArgument;
}

/**
 * Contains the definition of a @Use with the method called on a class, and the matching path and type.
 */
export interface UseDefinition {
  propertyName: string | symbol;
  type: UseType;
  path?: PathArgument;
}

/**
 * Marks a property as requiring a bodyParsed.json() before being called.
 */
export interface BodyParsedDecoratorDefinition {
  propertyName: string | symbol;
}

/**
 * Different types of usage for the @Use() decorator.
 */
export enum UseType {
  /**
   * Property or method representing a middleware function (express.RequestHandler). This is the default value.
   * Example:
   * <code><pre>
   *   @Use('/submit', UseType.MIDDLEWARE_FUNCTION)
   *   public submit(req: express.Request, res: express.Response, next: express.NextFunction): void {
   *     // next() should be called somewhere inside this function
   *   }
   *
   *   @Use('/proxy', UseType.MIDDLEWARE_FUNCTION)
   *   public proxy: express.RequestHandler;
   * </pre></code>
   */
  MIDDLEWARE_FUNCTION,

  /**
   * Method which will return a middleware function (express.RequestHandler). Must be zero-args.
   * Example:
   * <code><pre>
   *   @Use('/proxy', UseType.GETTER)
   *   public getProxy(): express.RequestHandler {
   *     return this.createProxy();
   *   }
   * </pre></code>
   */
  GETTER,

  /**
   * A property containing a whole sub-router which can be loaded using the RouterCreator.
   * Example:
   *
   * <code><pre>
   *   @Use('/restaurant', UseType.ROUTER)
   *   public restaurantRouter: RestaurantRouter;
   * </pre></code>
   */
  ROUTER
}
