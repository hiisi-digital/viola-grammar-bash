/**
 * Unit tests for Bash import parsing transform.
 *
 * Tests the parseImport transform which converts query captures
 * into ImportInfo objects. For real tree-sitter integration tests,
 * see grammar_test.ts.
 *
 * @module
 */

import { assertEquals } from "./assert.ts";
import { parseImport } from "../src/transforms/imports.ts";
import type { SyntaxNode, QueryCaptures } from "@hiisi/viola/grammars";

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

// Helper to create mock captures with import.from data
function createMockCaptures(fromText?: string, importNode?: SyntaxNode): QueryCaptures {
  const map = new Map<string, { node: SyntaxNode; text: string }>();

  if (fromText) {
    const node = importNode ?? createMockNode(fromText);
    map.set("import.from", { node, text: fromText });
  }

  if (importNode) {
    map.set("import", { node: importNode, text: importNode.text });
  }

  return {
    get: (name: string) => map.get(name),
    has: (name: string) => map.has(name),
    all: () => map,
  };
}

Deno.test("parseImport - extracts path from import.from capture", () => {
  const node = createMockNode("source ./lib/utils.sh");
  const captures = createMockCaptures("./lib/utils.sh");
  const result = parseImport(node, captures, "source ./lib/utils.sh");

  assertEquals(result.from, "./lib/utils.sh");
  assertEquals(result.name, "./lib/utils.sh");
  assertEquals(result.isNamespace, true);
  assertEquals(result.isTypeOnly, false);
});

Deno.test("parseImport - strips double quotes from path", () => {
  const node = createMockNode('source "./lib/helpers.sh"');
  const captures = createMockCaptures('"./lib/helpers.sh"');
  const result = parseImport(node, captures, 'source "./lib/helpers.sh"');

  assertEquals(result.from, "./lib/helpers.sh");
});

Deno.test("parseImport - strips single quotes from path", () => {
  const node = createMockNode("source './lib/functions.sh'");
  const captures = createMockCaptures("'./lib/functions.sh'");
  const result = parseImport(node, captures, "source './lib/functions.sh'");

  assertEquals(result.from, "./lib/functions.sh");
});

Deno.test("parseImport - handles absolute paths", () => {
  const node = createMockNode("source /etc/profile");
  const captures = createMockCaptures("/etc/profile");
  const result = parseImport(node, captures, "source /etc/profile");

  assertEquals(result.from, "/etc/profile");
});

Deno.test("parseImport - returns empty path when no capture", () => {
  const node = createMockNode("source");
  const captures = createMockCaptures(); // No import.from capture
  const result = parseImport(node, captures, "source");

  assertEquals(result.from, "");
  assertEquals(result.name, "");
});

Deno.test("parseImport - sets location from node", () => {
  const refNode: SyntaxNode = {
    type: "command",
    text: "source ./utils.sh",
    startPosition: { row: 5, column: 2 },
    endPosition: { row: 5, column: 19 },
    startIndex: 50,
    endIndex: 67,
    parent: null,
    children: [],
    namedChildren: [],
    childForFieldName: () => null,
    hasError: false,
    isMissing: false,
  };
  const captures = createMockCaptures("./utils.sh", refNode);
  const result = parseImport(refNode, captures, "source ./utils.sh");

  assertEquals(result.location.line, 6); // 0-indexed row + 1
  assertEquals(result.location.column, 3); // 0-indexed column + 1
});
