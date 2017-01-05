"use strict";
const express = require("express");
const lib_1 = require("./lib");
exports.Use = lib_1.Use;
exports.Get = lib_1.Get;
exports.Post = lib_1.Post;
exports.Put = lib_1.Put;
exports.Patch = lib_1.Patch;
exports.Delete = lib_1.Delete;
exports.Options = lib_1.Options;
exports.Response = lib_1.Response;
function createRouter(classInstance, options) {
    const promiseResponseFactory = new lib_1.PromiseResponseWrapper();
    if (options && options.log) {
        promiseResponseFactory.setLogger(options.log);
    }
    const creator = new lib_1.RouterCreator(() => express.Router(), lib_1.RouterRegistry.getInstance(), promiseResponseFactory);
    return creator.createRouter(classInstance);
}
exports.createRouter = createRouter;
