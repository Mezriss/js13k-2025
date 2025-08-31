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
  const svgContent = fs.readFileSync(filePath, "utf8");
  const parsed = parse(svgContent);

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

  const allPaths = findPaths(parsed);
  if (allPaths.length === 0) {
    console.log("No paths found in the SVG file.");
  } else {
    console.log(`Found ${allPaths.length} path(s):`);
    allPaths.forEach((path) => {
      const parsedPath = new SvgPath(path);
      parsedPath.setRelative(false);

      console.log(parsedPath.asString(1, true));
    });
  }
} catch (error) {
  console.error(`Error reading or parsing SVG file: ${error}`);
  process.exit(1);
}
