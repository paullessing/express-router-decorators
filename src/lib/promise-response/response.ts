export type ResponseBody = string | {};

export class Response {
  constructor(
    public responseCode: number,
    public body?: ResponseBody
  ) {}

  public static error(errorOrCode?: ResponseBody | number, responseError?: ResponseBody): Response {
    let error: ResponseBody;
    let responseCode: number;
    if (typeof errorOrCode === 'number') {
      responseCode = errorOrCode as number;
      error = responseError;
    } else {
      error = errorOrCode;
    }
    return new Response(responseCode || 500, error);
  }

  public static success(bodyOrCode?: ResponseBody | number, responseBody?: ResponseBody): Response {
    let body: ResponseBody;
    let responseCode: number;
    if (typeof bodyOrCode === 'number') {
      responseCode = bodyOrCode as number;
      body = responseBody;
    } else {
      body = bodyOrCode;
    }
    return new Response(responseCode || 200, body);
  }

  public static reject<T>(errorOrCode?: ResponseBody | number, responseError?: ResponseBody): Promise<T> {
    return Promise.reject<T>(Response.error(errorOrCode, responseError));
  }

  public static resolve(bodyOrCode?: ResponseBody | number, responseBody?: ResponseBody): Promise<Response> {
    return Promise.resolve(Response.success(bodyOrCode, responseBody));
  }
}
