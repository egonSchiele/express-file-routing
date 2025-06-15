import { readdirSync, statSync } from "fs"
import path from "path"

import type { File, Route } from "./types"

import {
  buildRoutePath,
  buildRouteUrl,
  calculatePriority,
  isCjs,
  isFileIgnored,
  mergePaths,
  prioritizeRoutes
} from "./utils"

const IS_ESM = !isCjs()

const MODULE_IMPORT_PREFIX = IS_ESM ? "file://" : ""

/**
 * Recursively walk a directory and return all nested files.
 *
 * @param directory The directory path to walk recursively
 * @param tree The tree of directories leading to the current directory
 *
 * @returns An array of all nested files in the specified directory
 */
export const walkTree = (directory: string, tree: string[] = []) => {
  const results: File[] = []

  for (const fileName of readdirSync(directory)) {
    const filePath = path.join(directory, fileName)
    const fileStats = statSync(filePath)

    if (fileStats.isDirectory()) {
      results.push(...walkTree(filePath, [...tree, fileName]))
    } else {
      results.push({
        name: fileName,
        path: directory,
        rel: mergePaths(...tree, fileName)
      })
    }
  }

  return results
}

/**
 * Generate routes from an array of files by loading them as modules.
 *
 * @param files An array of files to generate routes from
 *
 * @returns An array of routes
 */
export const generateRoutes = async (files: File[]) => {
  const routes: Route[] = []

  for (const file of files) {
    const parsedFile = path.parse(file.rel)

    if (isFileIgnored(parsedFile)) continue

    const routePath = buildRoutePath(parsedFile)
    const url = buildRouteUrl(routePath)
    const priority = calculatePriority(url)
    const exports = await import(
      MODULE_IMPORT_PREFIX + path.join(file.path, file.name)
    )
    routes.push({
      url,
      priority,
      exports
    })
  }

  return prioritizeRoutes(routes)
}

export function urlToFunctionName(url: string, method: string): string {
  return [...url.split("/"), method.toLowerCase()]
    .filter(Boolean)
    .map((part, i) => {
      let newPart = part.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
      if (i > 0) newPart = capitalize(newPart)
      return newPart
    })
    .join("")
}

export function urlToArgs(url: string): string {
  const defaultArgs = ["options:Record<string, any> = {}"]
  const args: string[] = []
  url
    .split("/")
    .filter(part => part.startsWith(":"))
    .forEach(part => {
      const argName = part.slice(1)
      if (argName) {
        args.push(`${argName}: string | number`)
      }
    })
  args.push(...defaultArgs)
  return args.join(", ")
}

export function urlToUrlString(url: string): string {
  return url
    .split("/")
    .map(part => {
      if (part.startsWith(":")) {
        return `\${${part.slice(1)}}`
      }
      return part
    })
    .join("/")
}

export function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
