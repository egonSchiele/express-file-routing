import type { ParsedPath } from "path"

import type { HandlerWithReturn, Route } from "./types"

import config from "./config"

export const isCjs = () => typeof module !== "undefined" && !!module?.exports

/**
 * @param parsedFile
 *
 * @returns Boolean Whether or not the file has to be excluded from route generation
 */
export const isFileIgnored = (parsedFile: ParsedPath) =>
  !config.VALID_FILE_EXTENSIONS.includes(parsedFile.ext.toLowerCase()) ||
  config.INVALID_NAME_SUFFIXES.some(suffix =>
    parsedFile.base.toLowerCase().endsWith(suffix)
  ) ||
  parsedFile.name.startsWith(config.IGNORE_PREFIX_CHAR) ||
  parsedFile.dir.startsWith(`/${config.IGNORE_PREFIX_CHAR}`)

export const isHandler = (
  handler: unknown
): handler is HandlerWithReturn | HandlerWithReturn[] =>
  typeof handler === "function" || Array.isArray(handler)

/**
 * @param routes
 *
 * @returns An array of sorted routes based on their priority
 */
export const prioritizeRoutes = (routes: Route[]) =>
  routes.sort((a, b) => a.priority - b.priority)

/**
 * ```ts
 * mergePaths("/posts/[id]", "index.ts") -> "/posts/[id]/index.ts"
 * ```
 *
 * @param paths An array of mergeable paths
 *
 * @returns A unification of all paths provided
 */
export const mergePaths = (...paths: string[]) =>
  "/" +
  paths
    .map(path => path.replace(/^\/|\/$/g, ""))
    .filter(path => path !== "")
    .join("/")

const regBackets = /\[([^}]*)\]/g

const transformBrackets = (value: string) =>
  regBackets.test(value) ? value.replace(regBackets, (_, s) => `:${s}`) : value

/**
 * @param path
 *
 * @returns A new path with all wrapping `[]` replaced by prefixed `:`
 */
export const convertParamSyntax = (path: string) => {
  const subpaths: string[] = []

  for (const subpath of path.split("/")) {
    subpaths.push(transformBrackets(subpath))
  }

  return mergePaths(...subpaths)
}

/**
 * ```ts
 * convertCatchallSyntax("/posts/:...catchall") -> "/posts/*"
 * ```
 *
 * @param url
 *
 * @returns A new url with all `:...` replaced by `*`
 */
export const convertCatchallSyntax = (url: string) =>
  url.replace(/:\.\.\.\w+/g, "*")

export const buildRoutePath = (parsedFile: ParsedPath): string => {
  // Normalize the directory path
  const normalizedDir =
    parsedFile.dir === parsedFile.root
      ? "/"
      : parsedFile.dir.startsWith("/")
      ? parsedFile.dir
      : `/${parsedFile.dir}`

  // Handle index files specially
  if (parsedFile.name === "index") {
    return normalizedDir === "/" ? "/" : normalizedDir
  }

  // Handle index.something files (like index.mod)
  if (parsedFile.name.startsWith("index.")) {
    return normalizedDir === "/" ? "/" : normalizedDir
  }

  // For regular files
  return `${normalizedDir === "/" ? "" : normalizedDir}/${parsedFile.name}`
}

/**
 * @param path
 *
 * @returns A new path with all wrapping `[]` replaced by prefixed `:` and all `:...` replaced by `*`
 */
export const buildRouteUrl = (path: string) => {
  const url = convertParamSyntax(path)
  return convertCatchallSyntax(url)
}

/**
 * The smaller the number the higher the priority with zero indicating highest priority
 *
 * @param url
 *
 * @returns An integer ranging from 0 to Infinity
 */
export const calculatePriority = (url: string) => {
  const depth = url.match(/\/.+?/g)?.length || 0
  const specifity = url.match(/\/:.+?/g)?.length || 0
  const catchall = url.match(/\/\*/g)?.length > 0 ? Infinity : 0

  return depth + specifity + catchall
}

export const getHandlers = (
  handler: HandlerWithReturn | HandlerWithReturn[]
): HandlerWithReturn[] => {
  if (!Array.isArray(handler)) return [handler]
  return handler
}

export const getMethodKey = (method: string) => {
  let methodKey = method.toLowerCase()

  if (methodKey === "del") return "delete"

  return methodKey
}
