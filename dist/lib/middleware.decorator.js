"use strict";
const router_registry_1 = require("./router.registry");
function Middleware(middleware) {
    return (clazz, propertyName) => {
        router_registry_1.RouterRegistry.getInstance().addMiddleware(clazz, propertyName, middleware);
    };
}
exports.Middleware = Middleware;
