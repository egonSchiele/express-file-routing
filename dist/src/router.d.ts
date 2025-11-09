import type { ExpressLike, Options, Route } from "./types.js";
export declare const makeRoutes: <T extends ExpressLike = ExpressLike>(app: T, routes: Route[], options?: Options) => void;
export declare const makeApiClient: (routes: Route[], options?: Options) => void;
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
declare const createRouter: <T extends ExpressLike = ExpressLike>(app: T, options?: Options) => Promise<T>;
export default createRouter;
