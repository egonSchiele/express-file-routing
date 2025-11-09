import { Router, type RouterOptions } from "express";
import type { Options } from "./types.js";
import createRouter from "./router.js";
export default createRouter;
export { createRouter };
/**
 * Routing middleware
 *
 * ```ts
 * app.use("/", await router())
 * ```
 *
 * @param options An options object (optional)
 */
export declare const router: (options?: Options & {
    routerOptions?: RouterOptions;
}) => Promise<Router>;
export { Options };
