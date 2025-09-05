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

interface GroupedPaths {
  [groupName: string]: string[];
}

try {
  const svgContent = fs.readFileSync(filePath, "utf8");
  const parsed = parse(svgContent);

  function findPathsWithGroups(
    node: any,
    currentGroup: string | null = null,
  ): GroupedPaths {
    const result: GroupedPaths = {};

    // Check if current node is a group
    let groupName = currentGroup;
    if (node.type === "element" && node.tagName === "g") {
      // Use label first, then id, then fall back to a generic name
      const label =
        node.properties?.["inkscape:label"] || node.properties?.label;
      const id = node.properties?.id;
      groupName =
        label || id || `group-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Check if current node is a path
    if (node.type === "element" && node.tagName === "path") {
      const pathData = node.properties?.d;
      if (pathData) {
        const group = groupName || "ungrouped";
        if (!result[group]) {
          result[group] = [];
        }
        result[group].push(pathData);
      }
    }

    // Recursively process children
    if (node.children) {
      for (const child of node.children) {
        const childResults = findPathsWithGroups(child, groupName);
        // Merge results
        for (const [group, paths] of Object.entries(childResults)) {
          if (!result[group]) {
            result[group] = [];
          }
          result[group].push(...paths);
        }
      }
    }

    return result;
  }

  const groupedPaths = findPathsWithGroups(parsed);
  const groupNames = Object.keys(groupedPaths);

  if (groupNames.length === 0) {
    console.log("No paths found in the SVG file.");
  } else {
    // Sort groups so "ungrouped" comes last if it exists
    const sortedGroups = groupNames.sort((a, b) => {
      if (a === "ungrouped") return 1;
      if (b === "ungrouped") return -1;
      return a.localeCompare(b);
    });

    const totalPaths = Object.values(groupedPaths).reduce(
      (sum, paths) => sum + paths.length,
      0,
    );
    console.log(
      `Found ${totalPaths} path(s) in ${groupNames.length} group(s):\n`,
    );

    for (const groupName of sortedGroups) {
      const paths = groupedPaths[groupName];
      console.log(
        `=== ${groupName} (${paths.length} path${paths.length === 1 ? "" : "s"}) ===`,
      );

      paths.forEach((path, index) => {
        const parsedPath = new SvgPath(path);
        parsedPath.setRelative(false);
        console.log(parsedPath.asString(1, true));
      });

      console.log(""); // Empty line between groups
    }
  }
} catch (error) {
  console.error(`Error reading or parsing SVG file: ${error}`);
  process.exit(1);
}
