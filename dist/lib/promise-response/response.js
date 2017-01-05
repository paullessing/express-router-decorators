"use strict";
class Response {
    constructor(responseCode, body) {
        this.responseCode = responseCode;
        this.body = body;
    }
    static error(error, responseCode) {
        if (typeof responseCode === 'undefined' && typeof error === 'number') {
            responseCode = error;
            error = undefined;
        }
        return new Response(responseCode || 500, error);
    }
    static success(body, responseCode) {
        if (typeof responseCode === 'undefined' && typeof body === 'number') {
            responseCode = body;
            body = undefined;
        }
        return new Response(responseCode || 200, body);
    }
    static reject(error, responseCode) {
        return Promise.reject(Response.error(error, responseCode));
    }
    static resolve(body, responseCode) {
        return Promise.resolve(Response.success(body, responseCode));
    }
}
exports.Response = Response;
