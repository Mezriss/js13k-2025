#!/usr/bin/env node
import process from "node:process";
import fs from "node:fs";

import { parse } from "svg-parser";
import { SvgPath } from "svg-path-editor-lib";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: svg2 <path-to-svg-file>");
  process.exit(1);
}

try {
  // Read the SVG file
  const svgContent = fs.readFileSync(filePath, "utf8");

  // Parse the SVG content
  const parsed = parse(svgContent);

  // Function to recursively find all path elements
  function findPaths(node: any): string[] {
    const paths: string[] = [];

    if (node.type === "element" && node.tagName === "path") {
      const pathData = node.properties?.d;
      if (pathData) {
        paths.push(pathData);
      }
    }

    if (node.children) {
      for (const child of node.children) {
        paths.push(...findPaths(child));
      }
    }

    return paths;
  }

  // Extract all paths from the parsed SVG
  const allPaths = findPaths(parsed);
  //console.info(JSON.stringify(parsed, null, 2));
  if (allPaths.length === 0) {
    console.log("No paths found in the SVG file.");
  } else {
    console.log(`Found ${allPaths.length} path(s):`);
    allPaths.forEach((path, index) => {
      // console.log(`Path ${index + 1}:`);
      // console.log(path);
      const parsedPath = new SvgPath(path);
      parsedPath.setRelative(false);

      // console.info("Optimized:");
      console.log(parsedPath.asString(1, true));
      // console.log("---");
    });
  }
} catch (error) {
  console.error(`Error reading or parsing SVG file: ${error}`);
  process.exit(1);
}
