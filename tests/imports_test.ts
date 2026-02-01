/**
 * Tests for Bash import parsing.
 * 
 * @module
 */

import { assertEquals } from "./assert.ts";
import { parseImport } from "../src/transforms/imports.ts";
import type { SyntaxNode } from "../src/types.ts";

// Helper to create a mock syntax node
function createMockNode(text: string): SyntaxNode {
  return {
    type: "command",
    startIndex: 0,
    endIndex: text.length,
    children: [],
    namedChildren: [],
    text: text,
  };
}

Deno.test("parseImport - extracts literal path from source", () => {
  const text = "source ./lib/utils.sh";
  const node = createMockNode(text);
  const path = parseImport(node, text);
  
  assertEquals(path, "./lib/utils.sh");
});

Deno.test("parseImport - extracts literal path from dot command", () => {
  const text = ". ./lib/config.sh";
  const node = createMockNode(text);
  const path = parseImport(node, text);
  
  assertEquals(path, "./lib/config.sh");
});

Deno.test("parseImport - handles double-quoted paths", () => {
  const text = 'source "./lib/helpers.sh"';
  const node = createMockNode(text);
  const path = parseImport(node, text);
  
  assertEquals(path, "./lib/helpers.sh");
});

Deno.test("parseImport - handles single-quoted paths", () => {
  const text = "source './lib/functions.sh'";
  const node = createMockNode(text);
  const path = parseImport(node, text);
  
  assertEquals(path, "./lib/functions.sh");
});

Deno.test("parseImport - returns undefined for variable paths", () => {
  const text = 'source "$LIB_DIR/module.sh"';
  const node = createMockNode(text);
  const path = parseImport(node, text);
  
  assertEquals(path, undefined);
});

Deno.test("parseImport - returns undefined for command substitution", () => {
  const text = "source `get_path`";
  const node = createMockNode(text);
  const path = parseImport(node, text);
  
  assertEquals(path, undefined);
});

Deno.test("parseImport - handles absolute paths", () => {
  const text = "source /etc/profile";
  const node = createMockNode(text);
  const path = parseImport(node, text);
  
  assertEquals(path, "/etc/profile");
});
