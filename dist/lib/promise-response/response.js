"use strict";
class Response {
    constructor(responseCode, body) {
        this.responseCode = responseCode;
        this.body = body;
    }
    static error(errorOrCode, responseError) {
        let error;
        let responseCode;
        if (typeof errorOrCode === 'number') {
            responseCode = errorOrCode;
            error = responseError;
        }
        else {
            error = errorOrCode;
        }
        return new Response(responseCode || 500, error);
    }
    static success(bodyOrCode, responseBody) {
        let body;
        let responseCode;
        if (typeof bodyOrCode === 'number') {
            responseCode = bodyOrCode;
            body = responseBody;
        }
        else {
            body = bodyOrCode;
        }
        return new Response(responseCode || 200, body);
    }
    static reject(errorOrCode, responseError) {
        return Promise.reject(Response.error(errorOrCode, responseError));
    }
    static resolve(bodyOrCode, responseBody) {
        return Promise.resolve(Response.success(bodyOrCode, responseBody));
    }
}
exports.Response = Response;
