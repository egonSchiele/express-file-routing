#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { makeApiClient } from "../src/router.js";
import { generateRoutes, walkTree } from "../src/lib.js";
export const compileClient = () => __awaiter(void 0, void 0, void 0, function* () {
    // Read command-line arguments
    const routesDirectory = process.argv[2];
    const apiClientDirectory = process.argv[3];
    const apiClientTypeFile = process.argv.length > 4 ? process.argv[4] : undefined;
    const options = {
        routesDirectory,
        apiClientDirectory,
        apiClientTypeFile
    };
    const files = walkTree(options.routesDirectory);
    const routes = yield generateRoutes(files);
    makeApiClient(routes, options);
});
if (process.argv.length < 4) {
    console.log("Usage: compile-client <routesDirectory> <apiClientDirectory> <apiClientTypeFile>");
    console.log("Example: compile-client ./routes ./generated ./types/api-types");
    process.exit(1);
}
compileClient();
//# sourceMappingURL=compile-client.js.map