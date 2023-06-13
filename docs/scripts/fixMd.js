#! /bin/node

// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

// Check README.md for more info of what this script does.

const { resolve } = require("path")
const fs = require("fs").promises

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error(
    "You should provide the path which contains the Markdown files to be fixed as an argument"
  )
  return
}

async function* getFiles(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of files) {
    const res = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      yield* getFiles(res)
    } else {
      if (entry.name.endsWith(".md")) {
        yield res
      }
    }
  }
}

const fixContent = async filePath => {
  const content = await fs.readFile(filePath, "utf8")

  // Pattern 1
  let fixedContent = content.replace(/\*\n/g, "\n")

  fixedContent = fixedContent.replace(/\/\n/g, "\n")

  // Pattern 2
  fixedContent = fixedContent.replace(/\/\/ @notice /g, "\n")

  // Pattern 3
  // With events no extra \n is appended after a parameter table
  fixedContent = fixedContent.replace(/(#+ .+)/g, "\n\n$1")

  if (fixedContent != content) {
    console.log("Fixed", filePath)
    fs.writeFile(filePath, fixedContent)
  }
}

const fix = async dir => {
  for await (const f of getFiles(dir)) {
    await fixContent(f)
  }
}

fix(args[0])
