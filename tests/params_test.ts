/**
 * Tests for Bash positional parameter extraction.
 * 
 * @module
 */

import { assertEquals, assert } from "./assert.ts";
import { parseParams } from "../src/transforms/params.ts";
import type { SyntaxNode } from "@hiisi/viola/grammars";

// Helper to create a mock syntax node
function createMockNode(source: string, start: number, end: number): SyntaxNode {
  return {
    type: "compound_statement",
    text: source.slice(start, end),
    startPosition: { row: 0, column: start },
    endPosition: { row: 0, column: end },
    startIndex: start,
    endIndex: end,
    parent: null,
    children: [],
    namedChildren: [],
    childForFieldName: () => null,
    hasError: false,
    isMissing: false,
  };
}

Deno.test("parseParams - detects simple positional parameters", () => {
  const source = `{
    local name="$1"
    local value="$2"
    echo "$name: $value"
  }`;
  
  const node = createMockNode(source, 0, source.length);
  const params = parseParams(node, source);
  
  assertEquals(params.length, 2);
  assert(params[0]);
  assertEquals(params[0].name, "$1");
  assertEquals(params[0].optional, false);
  assert(params[1]);
  assertEquals(params[1].name, "$2");
  assertEquals(params[1].optional, false);
});

Deno.test("parseParams - detects parameters with defaults", () => {
  const source = `{
    local name="$1"
    local greeting="\${2:-Hello}"
    echo "$greeting, $name"
  }`;
  
  const node = createMockNode(source, 0, source.length);
  const params = parseParams(node, source);
  
  assertEquals(params.length, 2);
  assert(params[0]);
  assertEquals(params[0].name, "$1");
  assertEquals(params[0].optional, false);
  assert(params[1]);
  assertEquals(params[1].name, "$2");
  assertEquals(params[1].optional, true);
  assertEquals(params[1].defaultValue, "Hello");
});

Deno.test("parseParams - detects rest parameters", () => {
  const source = `{
    for arg in "$@"; do
      echo "$arg"
    done
  }`;
  
  const node = createMockNode(source, 0, source.length);
  const params = parseParams(node, source);
  
  assertEquals(params.length, 1);
  assert(params[0]);
  assertEquals(params[0].name, "$@");
  assertEquals(params[0].rest, true);
  assertEquals(params[0].optional, true);
});

Deno.test("parseParams - detects mixed parameters", () => {
  const source = `{
    local first="$1"
    local second="\${2:-default}"
    shift 2
    echo "Rest: $@"
  }`;
  
  const node = createMockNode(source, 0, source.length);
  const params = parseParams(node, source);
  
  assertEquals(params.length, 3);
  assert(params[0]);
  assertEquals(params[0].name, "$1");
  assertEquals(params[0].optional, false);
  assert(params[1]);
  assertEquals(params[1].name, "$2");
  assertEquals(params[1].optional, true);
  assert(params[2]);
  assertEquals(params[2].name, "$@");
  assertEquals(params[2].rest, true);
});

Deno.test("parseParams - handles braced parameters", () => {
  const source = `{
    echo "\${1}"
    echo "\${2}"
    echo "\${10}"
  }`;
  
  const node = createMockNode(source, 0, source.length);
  const params = parseParams(node, source);
  
  assertEquals(params.length, 10);
  assert(params[9]);
  assertEquals(params[9].name, "$10");
});

Deno.test("parseParams - empty body returns no parameters", () => {
  const source = `{
    :
  }`;
  
  const node = createMockNode(source, 0, source.length);
  const params = parseParams(node, source);
  
  assertEquals(params.length, 0);
});

Deno.test("parseParams - handles alternate default syntax", () => {
  const source = `{
    local value="\${1-fallback}"
    echo "$value"
  }`;
  
  const node = createMockNode(source, 0, source.length);
  const params = parseParams(node, source);
  
  assertEquals(params.length, 1);
  assert(params[0]);
  assertEquals(params[0].name, "$1");
  assertEquals(params[0].optional, true);
  assertEquals(params[0].defaultValue, "fallback");
});
