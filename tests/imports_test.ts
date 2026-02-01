/**
 * Tests for Bash import parsing.
 * 
 * @module
 */

import { assertEquals } from "./assert.ts";
import { parseImport } from "../src/transforms/imports.ts";
import type { SyntaxNode, QueryCaptures } from "https://raw.githubusercontent.com/hiisi-digital/viola/main/src/grammars/types.ts";

// Helper to create a mock syntax node
function createMockNode(text: string): SyntaxNode {
  return {
    type: "command",
    text: text,
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: text.length },
    startIndex: 0,
    endIndex: text.length,
    parent: null,
    children: [],
    namedChildren: [],
    childForFieldName: () => null,
    hasError: false,
    isMissing: false,
  };
}

// Helper to create empty mock captures
function createMockCaptures(): QueryCaptures {
  return {
    get: () => undefined,
    has: () => false,
    all: () => new Map(),
  };
}

Deno.test("parseImport - extracts literal path from source", () => {
  const text = "source ./lib/utils.sh";
  const node = createMockNode(text);
  const captures = createMockCaptures();
  const path = parseImport(node, captures, text);
  
  assertEquals(path, "./lib/utils.sh");
});

Deno.test("parseImport - extracts literal path from dot command", () => {
  const text = ". ./lib/config.sh";
  const node = createMockNode(text);
  const captures = createMockCaptures();
  const path = parseImport(node, captures, text);
  
  assertEquals(path, "./lib/config.sh");
});

Deno.test("parseImport - handles double-quoted paths", () => {
  const text = 'source "./lib/helpers.sh"';
  const node = createMockNode(text);
  const captures = createMockCaptures();
  const path = parseImport(node, captures, text);
  
  assertEquals(path, "./lib/helpers.sh");
});

Deno.test("parseImport - handles single-quoted paths", () => {
  const text = "source './lib/functions.sh'";
  const node = createMockNode(text);
  const captures = createMockCaptures();
  const path = parseImport(node, captures, text);
  
  assertEquals(path, "./lib/functions.sh");
});

Deno.test("parseImport - returns undefined for variable paths", () => {
  const text = 'source "$LIB_DIR/module.sh"';
  const node = createMockNode(text);
  const captures = createMockCaptures();
  const path = parseImport(node, captures, text);
  
  assertEquals(path, undefined);
});

Deno.test("parseImport - returns undefined for command substitution", () => {
  const text = "source `get_path`";
  const node = createMockNode(text);
  const captures = createMockCaptures();
  const path = parseImport(node, captures, text);
  
  assertEquals(path, undefined);
});

Deno.test("parseImport - handles absolute paths", () => {
  const text = "source /etc/profile";
  const node = createMockNode(text);
  const captures = createMockCaptures();
  const path = parseImport(node, captures, text);
  
  assertEquals(path, "/etc/profile");
});
