var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { readdirSync, statSync } from "fs";
import path from "path";
import { buildRoutePath, buildRouteUrl, calculatePriority, isCjs, isFileIgnored, mergePaths, prioritizeRoutes } from "./utils.js";
const IS_ESM = !isCjs();
const MODULE_IMPORT_PREFIX = IS_ESM ? "file://" : "";
/**
 * Recursively walk a directory and return all nested files.
 *
 * @param directory The directory path to walk recursively
 * @param tree The tree of directories leading to the current directory
 *
 * @returns An array of all nested files in the specified directory
 */
export const walkTree = (directory, tree = []) => {
    const results = [];
    for (const fileName of readdirSync(directory)) {
        const filePath = path.join(directory, fileName);
        const fileStats = statSync(filePath);
        if (fileStats.isDirectory()) {
            results.push(...walkTree(filePath, [...tree, fileName]));
        }
        else {
            results.push({
                name: fileName,
                path: directory,
                rel: mergePaths(...tree, fileName)
            });
        }
    }
    return results;
};
/**
 * Generate routes from an array of files by loading them as modules.
 *
 * @param files An array of files to generate routes from
 *
 * @returns An array of routes
 */
export const generateRoutes = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const routes = [];
    for (const file of files) {
        const parsedFile = path.parse(file.rel);
        if (isFileIgnored(parsedFile))
            continue;
        const routePath = buildRoutePath(parsedFile);
        const url = buildRouteUrl(routePath);
        const priority = calculatePriority(url);
        const exports = yield import(MODULE_IMPORT_PREFIX + path.join(file.path, file.name));
        routes.push({
            url,
            priority,
            exports
        });
    }
    return prioritizeRoutes(routes);
});
export function urlToFunctionName(url, method) {
    return [...url.split("/"), method.toLowerCase()]
        .filter(Boolean)
        .map((part, i) => {
        let newPart = part.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        if (i > 0)
            newPart = capitalize(newPart);
        return newPart;
    })
        .join("");
}
export function urlToArgs(url) {
    const defaultArgs = ["options:Record<string, any> = {}"];
    const args = [];
    url
        .split("/")
        .filter(part => part.startsWith(":"))
        .forEach(part => {
        const argName = part.slice(1);
        if (argName) {
            args.push(`${argName}: string | number`);
        }
    });
    args.push(...defaultArgs);
    return args.join(", ");
}
export function urlToUrlString(url) {
    return url
        .split("/")
        .map(part => {
        if (part.startsWith(":")) {
            return `\${${part.slice(1)}}`;
        }
        return part;
    })
        .join("/");
}
export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
//# sourceMappingURL=lib.js.map