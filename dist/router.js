var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import fs from "fs";
import path from "path";
import config from "./config.js";
import { generateRoutes, urlToArgs, urlToFunctionName, urlToUrlString, walkTree } from "./lib.js";
import { getHandlers, getMethodKey, isHandler } from "./utils.js";
import renderClientTemplate from "./templates/apiClient.js";
const CJS_MAIN_FILENAME = typeof require !== "undefined" && ((_a = require.main) === null || _a === void 0 ? void 0 : _a.filename);
const PROJECT_DIRECTORY = CJS_MAIN_FILENAME
    ? path.dirname(CJS_MAIN_FILENAME)
    : process.cwd();
const wrapHandler = (handler) => {
    const wrappedHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield handler(req, res, next);
            if (result !== undefined) {
                res.json(result);
            }
        }
        catch (error) {
            console.error("Error in handler:", error);
            res.status(500).send("Internal Server Error").end();
        }
    });
    return wrappedHandler;
};
const makeRoutes = (app, routes, options = {}) => {
    var _a;
    for (const { url, exports } of routes) {
        const exportedMethods = Object.entries(exports);
        for (const [method, handler] of exportedMethods) {
            const methodKey = getMethodKey(method);
            const handlers = getHandlers(handler);
            if (!((_a = options.additionalMethods) === null || _a === void 0 ? void 0 : _a.includes(methodKey)) &&
                !config.DEFAULT_METHOD_EXPORTS.includes(methodKey)) {
                continue;
            }
            const wrappedHandlers = handlers.map(wrapHandler);
            app[methodKey](url, ...wrappedHandlers);
        }
        // wildcard default export route matching
        if (typeof exports.default !== "undefined") {
            if (isHandler(exports.default)) {
                app.all.apply(app, [
                    url,
                    ...getHandlers(exports.default).map(wrapHandler)
                ]);
            }
            else if (typeof exports.default === "object" &&
                isHandler(exports.default.default)) {
                app.all.apply(app, [
                    url,
                    ...getHandlers(exports.default.default).map(wrapHandler)
                ]);
            }
        }
    }
};
const makeApiClient = (routes, options = {}) => {
    var _a;
    if (!options.apiClientDirectory) {
        return;
    }
    // make options.apiClientDirectory if it does not exist
    const dirExists = fs.existsSync(options.apiClientDirectory);
    if (!dirExists) {
        console.log(`API client directory does not exist, creating: ${options.apiClientDirectory}`);
        fs.mkdirSync(options.apiClientDirectory, { recursive: true });
    }
    const apiClientPath = path.join(options.apiClientDirectory, "apiClient.ts");
    let header = "// Auto-generated API client\n\n";
    let content = "";
    const typesToImport = [];
    for (const { url, exports } of routes) {
        const exportedMethods = Object.entries(exports);
        const methodNames = exportedMethods.map(([method, handler]) => method);
        for (const [method, handler] of exportedMethods) {
            const methodKey = getMethodKey(method);
            const handlers = getHandlers(handler);
            if (!((_a = options.additionalMethods) === null || _a === void 0 ? void 0 : _a.includes(methodKey)) &&
                !config.DEFAULT_METHOD_EXPORTS.includes(methodKey)) {
                continue;
            }
            const methodName = methodKey.toUpperCase();
            let responseType = "any";
            const typeVarName = `${methodName.toLowerCase()}Type`;
            if (options.apiClientTypeFile && methodNames.includes(typeVarName)) {
                const typeExport = exportedMethods.find(([key]) => key === typeVarName);
                if (typeExport) {
                    responseType = typeExport[1];
                    typesToImport.push(responseType);
                }
            }
            if (url.startsWith("/api/")) {
                content +=
                    renderClientTemplate({
                        url: urlToUrlString(url),
                        args: urlToArgs(url),
                        method: methodName,
                        responseType,
                        functionName: urlToFunctionName(url, methodName)
                    }) + "\n";
            }
        }
    }
    if (typesToImport.length > 0) {
        header += `import type { ${typesToImport.join(", ")} } from "${options.apiClientTypeFile}"\n\n`;
    }
    content = header + content;
    fs.writeFileSync(apiClientPath, content, "utf8");
    console.log(`API client generated at: ${apiClientPath}`);
};
/**
 * Attach routes to an Express app or router instance
 *
 * ```ts
 * await createRouter(app)
 * ```
 *
 * @param app An express app or router instance
 * @param options An options object (optional)
 */
const createRouter = (app_1, ...args_1) => __awaiter(void 0, [app_1, ...args_1], void 0, function* (app, options = {}) {
    const files = walkTree(options.directory || path.join(PROJECT_DIRECTORY, "routes"));
    const routes = yield generateRoutes(files);
    makeRoutes(app, routes, options);
    if (options.apiClientDirectory) {
        makeApiClient(routes, options);
    }
    return app;
});
export default createRouter;
//# sourceMappingURL=router.js.map