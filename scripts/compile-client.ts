#!/usr/bin/env node
import { makeApiClient } from "../src/router.js"
import { generateRoutes, walkTree } from "../src/lib.js"
import path from "path"
export const compileClient = async () => {
  // Read command-line arguments
  const routesDirectory = path.join(process.cwd(), process.argv[2])
  const apiClientDirectory = process.argv[3]
  const apiClientTypeFile =
    process.argv.length > 4 ? process.argv[4] : undefined

  const options = {
    routesDirectory,
    apiClientDirectory,
    apiClientTypeFile
  }
  const files = walkTree(options.routesDirectory)
  console.log(`\x1b[32m Found ${files.length} route files:\x1b[m`)
  for (const file of files) {
    console.log(`- ${file.rel}`)
  }

  const routes = await generateRoutes(files)
  makeApiClient(routes, options)
}

if (process.argv.length < 4) {
  console.log(
    "Usage: compile-client <routesDirectory> <apiClientDirectory> <apiClientTypeFile>"
  )
  console.log(
    "Example: compile-client ./routes ./generated ./types/api-types.ts"
  )
  console.log(
    "The routes directory path should be in your dist folder so that any path aliases you use are accounted for.\n The apiClientTypeFile should be exactly the path that should get imported in the generated apiClient file.\nThe apiClientDirectory should be in your source code, since it will get included in the build."
  )
  process.exit(1)
}

compileClient()
