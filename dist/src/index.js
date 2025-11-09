var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
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
export const router = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (options = {}) {
    const routerOptions = (options === null || options === void 0 ? void 0 : options.routerOptions) || {};
    return yield createRouter(Router(routerOptions), options);
});
//# sourceMappingURL=index.js.map