/// <reference types="qs" />
import type { ParsedPath } from "path";
import type { HandlerWithReturn, Route } from "./types";
export declare const isCjs: () => boolean;
/**
 * @param parsedFile
 *
 * @returns Boolean Whether or not the file has to be excluded from route generation
 */
export declare const isFileIgnored: (parsedFile: ParsedPath) => boolean;
export declare const isHandler: (handler: unknown) => handler is ((req: import("express-serve-static-core").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express-serve-static-core").Response<any, Record<string, any>, number>, next: import("express-serve-static-core").NextFunction) => Promise<import("./types").JSONResponse>) | ((req: import("express-serve-static-core").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express-serve-static-core").Response<any, Record<string, any>, number>, next: import("express-serve-static-core").NextFunction) => Promise<import("./types").JSONResponse>)[];
/**
 * @param routes
 *
 * @returns An array of sorted routes based on their priority
 */
export declare const prioritizeRoutes: (routes: Route[]) => Route[];
/**
 * ```ts
 * mergePaths("/posts/[id]", "index.ts") -> "/posts/[id]/index.ts"
 * ```
 *
 * @param paths An array of mergeable paths
 *
 * @returns A unification of all paths provided
 */
export declare const mergePaths: (...paths: string[]) => string;
/**
 * @param path
 *
 * @returns A new path with all wrapping `[]` replaced by prefixed `:`
 */
export declare const convertParamSyntax: (path: string) => string;
/**
 * ```ts
 * convertCatchallSyntax("/posts/:...catchall") -> "/posts/*"
 * ```
 *
 * @param url
 *
 * @returns A new url with all `:...` replaced by `*`
 */
export declare const convertCatchallSyntax: (url: string) => string;
export declare const buildRoutePath: (parsedFile: ParsedPath) => string;
/**
 * @param path
 *
 * @returns A new path with all wrapping `[]` replaced by prefixed `:` and all `:...` replaced by `*`
 */
export declare const buildRouteUrl: (path: string) => string;
/**
 * The smaller the number the higher the priority with zero indicating highest priority
 *
 * @param url
 *
 * @returns An integer ranging from 0 to Infinity
 */
export declare const calculatePriority: (url: string) => number;
export declare const getHandlers: (handler: HandlerWithReturn | HandlerWithReturn[]) => HandlerWithReturn[];
export declare const getMethodKey: (method: string) => string;
