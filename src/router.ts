import fs from "fs"
import path from "path"

import type { ExpressLike, HandlerWithReturn, Options, Route } from "./types.js"

import config from "./config.js"

import { Handler, NextFunction, Request, Response } from "express"
import {
  generateRoutes,
  urlToArgs,
  urlToFunctionName,
  urlToUrlString,
  walkTree
} from "./lib.js"
import { getHandlers, getMethodKey, isHandler } from "./utils.js"
import renderClientTemplate from "./templates/apiClient.js"

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
    } catch (error) {
      console.error("Error in handler:", error)
      res.status(500).send("Internal Server Error").end()
    }
  }
  return wrappedHandler
}

export const makeRoutes = <T extends ExpressLike = ExpressLike>(
  app: T,
  routes: Route[],
  options: Options = {}
): void => {
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
}

export const makeApiClient = (routes: Route[], options: Options = {}): void => {
  if (!options.apiClientDirectory) {
    return
  }
  // make options.apiClientDirectory if it does not exist
  const dirExists = fs.existsSync(options.apiClientDirectory)
  if (!dirExists) {
    console.log(
      `API client directory does not exist, creating: ${options.apiClientDirectory}`
    )
    fs.mkdirSync(options.apiClientDirectory, { recursive: true })
  }
  const apiClientPath = path.join(options.apiClientDirectory, "apiClient.ts")
  let header = "// Auto-generated API client\n\n"
  let content = ""
  const typesToImport: string[] = []

  for (const { url, exports } of routes) {
    const exportedMethods = Object.entries(exports)
    const methodNames = exportedMethods.map(([method, handler]) => method)
    for (const [method, handler] of exportedMethods) {
      const methodKey = getMethodKey(method)
      const handlers = getHandlers(handler)

      if (
        !options.additionalMethods?.includes(methodKey) &&
        !config.DEFAULT_METHOD_EXPORTS.includes(methodKey)
      ) {
        continue
      }
      const methodName = methodKey.toUpperCase()
      let responseType = "any"
      const typeVarName = `${methodName.toLowerCase()}Type`
      if (options.apiClientTypeFile && methodNames.includes(typeVarName)) {
        const typeExport = exportedMethods.find(([key]) => key === typeVarName)
        if (typeExport) {
          responseType = typeExport[1] as any
          typesToImport.push(responseType)
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
          }) + "\n"
      }
    }
  }
  if (typesToImport.length > 0) {
    header += `import type { ${typesToImport.join(", ")} } from "${
      options.apiClientTypeFile
    }"\n\n`
  }

  content = header + content

  fs.writeFileSync(apiClientPath, content, "utf8")
  console.log(`API client generated at: ${apiClientPath}`)
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
  makeRoutes(app, routes, options)

  if (options.apiClientDirectory) {
    makeApiClient(routes, options)
  }

  return app
}

export default createRouter
