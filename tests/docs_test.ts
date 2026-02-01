/**
 * Tests for Bash documentation comment parsing.
 * 
 * @module
 */

import { assertEquals } from "./assert.ts";
import { parseDocComment } from "../src/transforms/docs.ts";
import type { SyntaxNode } from "https://raw.githubusercontent.com/hiisi-digital/viola/main/src/grammars/types.ts";

// Helper to create a mock syntax node
function createMockNode(text: string): SyntaxNode {
  return {
    type: "comment",
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

Deno.test("parseDocComment - strips hash prefix", () => {
  const text = "# This is a comment";
  const node = createMockNode(text);
  const parsed = parseDocComment(node, text);
  
  assertEquals(parsed, "This is a comment");
});

Deno.test("parseDocComment - handles comments with no space after hash", () => {
  const text = "#This is a comment";
  const node = createMockNode(text);
  const parsed = parseDocComment(node, text);
  
  assertEquals(parsed, "This is a comment");
});

Deno.test("parseDocComment - trims whitespace", () => {
  const text = "#   This is a comment   ";
  const node = createMockNode(text);
  const parsed = parseDocComment(node, text);
  
  assertEquals(parsed, "This is a comment");
});

Deno.test("parseDocComment - handles empty comments", () => {
  const text = "#";
  const node = createMockNode(text);
  const parsed = parseDocComment(node, text);
  
  assertEquals(parsed, "");
});

Deno.test("parseDocComment - preserves content", () => {
  const text = "# Function to greet users";
  const node = createMockNode(text);
  const parsed = parseDocComment(node, text);
  
  assertEquals(parsed, "Function to greet users");
});
