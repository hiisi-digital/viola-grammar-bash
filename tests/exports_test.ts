/**
 * Tests for Bash export detection.
 * 
 * @module
 */

import { assertEquals } from "./assert.ts";
import { isExported } from "../src/transforms/exports.ts";
import type { SyntaxNode, QueryCaptures } from "../src/viola-types.ts";

// Helper to create a mock syntax node with source
function createMockNode(source: string, functionName: string): SyntaxNode {
  const mockNode: SyntaxNode = {
    type: "function_definition",
    text: source,
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: source.length },
    startIndex: 0,
    endIndex: source.length,
    parent: null,
    children: [],
    namedChildren: [],
    childForFieldName: () => null,
    hasError: false,
    isMissing: false,
  };
  return mockNode;
}

// Helper to create mock captures
function createMockCaptures(functionName: string): QueryCaptures {
  const capturesMap = new Map([
    ["function.name", { node: {} as SyntaxNode, text: functionName }]
  ]);
  
  return {
    get: (name: string) => capturesMap.get(name),
    has: (name: string) => capturesMap.has(name),
    all: () => capturesMap,
  };
}

Deno.test("isExported - detects exported function", () => {
  const source = `
function greet() {
  echo "hello"
}
export -f greet
  `;
  
  const node = createMockNode(source, "greet");
  const captures = createMockCaptures("greet");
  
  assertEquals(isExported(node, captures), true);
});

Deno.test("isExported - returns false for non-exported function", () => {
  const source = `
function greet() {
  echo "hello"
}
  `;
  
  const node = createMockNode(source, "greet");
  const captures = createMockCaptures("greet");
  
  assertEquals(isExported(node, captures), false);
});

Deno.test("isExported - handles multiple exports", () => {
  const source = `
function foo() { echo "foo"; }
function bar() { echo "bar"; }
export -f foo
export -f bar
  `;
  
  const node1 = createMockNode(source, "foo");
  const captures1 = createMockCaptures("foo");
  
  const node2 = createMockNode(source, "bar");
  const captures2 = createMockCaptures("bar");
  
  assertEquals(isExported(node1, captures1), true);
  assertEquals(isExported(node2, captures2), true);
});

Deno.test("isExported - handles export with extra whitespace", () => {
  const source = `
function test() { echo "test"; }
export   -f   test
  `;
  
  const node = createMockNode(source, "test");
  const captures = createMockCaptures("test");
  
  assertEquals(isExported(node, captures), true);
});

Deno.test("isExported - does not match partial names", () => {
  const source = `
function test() { echo "test"; }
function testing() { echo "testing"; }
export -f test
  `;
  
  const node1 = createMockNode(source, "test");
  const captures1 = createMockCaptures("test");
  
  const node2 = createMockNode(source, "testing");
  const captures2 = createMockCaptures("testing");
  
  assertEquals(isExported(node1, captures1), true);
  assertEquals(isExported(node2, captures2), false);
});
