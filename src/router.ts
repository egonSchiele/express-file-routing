import path from "path"

import type { ExpressLike, HandlerWithReturn, Options } from "./types"

import config from "./config"

import { Handler, NextFunction, Request, Response } from "express"
import { generateRoutes, walkTree } from "./lib"
import { getHandlers, getMethodKey, isHandler } from "./utils"

const CJS_MAIN_FILENAME =
  typeof require !== "undefined" && require.main?.filename

const PROJECT_DIRECTORY = CJS_MAIN_FILENAME
  ? path.dirname(CJS_MAIN_FILENAME)
  : process.cwd()

const wrapHandler = (handler: HandlerWithReturn): Handler => {
  const wrappedHandler: Handler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await handler(req, res, next)
      if (result !== undefined) {
        res.json(result)
      }
      res.end()
    } catch (error) {
      res.status(500).send("Internal Server Error").end()
    }
  }
  return wrappedHandler
}

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
const createRouter = async <T extends ExpressLike = ExpressLike>(
  app: T,
  options: Options = {}
): Promise<T> => {
  const files = walkTree(
    options.directory || path.join(PROJECT_DIRECTORY, "routes")
  )

  const routes = await generateRoutes(files)

  for (const { url, exports } of routes) {
    const exportedMethods = Object.entries(exports)

    for (const [method, handler] of exportedMethods) {
      const methodKey = getMethodKey(method)
      const handlers = getHandlers(handler)

      if (
        !options.additionalMethods?.includes(methodKey) &&
        !config.DEFAULT_METHOD_EXPORTS.includes(methodKey)
      ) {
        continue
      }

      const wrappedHandlers = handlers.map(wrapHandler)

      app[methodKey](url, ...wrappedHandlers)
    }

    // wildcard default export route matching
    if (typeof exports.default !== "undefined") {
      if (isHandler(exports.default)) {
        app.all.apply(app, [
          url,
          ...getHandlers(exports.default).map(wrapHandler)
        ])
      } else if (
        typeof exports.default === "object" &&
        isHandler(exports.default.default)
      ) {
        app.all.apply(app, [
          url,
          ...getHandlers(exports.default.default).map(wrapHandler)
        ])
      }
    }
  }

  return app
}

export default createRouter
