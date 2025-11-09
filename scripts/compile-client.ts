#!/usr/bin/env node
import { makeApiClient } from "../src/router.js"
import { generateRoutes, walkTree } from "../src/lib.js"

export const compileClient = async () => {
  // Read command-line arguments
  const routesDirectory = process.argv[2]
  const apiClientDirectory = process.argv[3]
  const apiClientTypeFile =
    process.argv.length > 4 ? process.argv[4] : undefined

  const options = {
    routesDirectory,
    apiClientDirectory,
    apiClientTypeFile
  }
  const files = walkTree(options.routesDirectory)
  console.log(`Found ${files.length} route files:`)
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
  process.exit(1)
}

compileClient()
