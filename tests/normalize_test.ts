/**
 * Tests for Bash normalization functions.
 * 
 * @module
 */

import { assertEquals } from "./assert.ts";
import { normalizeBody, normalizeHereDoc } from "../src/transforms/normalize.ts";
import type { SyntaxNode } from "../src/types.ts";

// Helper to create a mock syntax node
function createMockNode(source: string, start: number, end: number): SyntaxNode {
  return {
    type: "compound_statement",
    startIndex: start,
    endIndex: end,
    children: [],
    namedChildren: [],
    text: source.slice(start, end),
  };
}

Deno.test("normalizeBody - trims whitespace", () => {
  const source = `  
    echo "hello"
  `;
  
  const node = createMockNode(source, 0, source.length);
  const normalized = normalizeBody(node, source);
  
  assertEquals(normalized, `echo "hello"`);
});

Deno.test("normalizeBody - normalizes line endings", () => {
  const source = "echo 'hello'\r\necho 'world'\r";
  
  const node = createMockNode(source, 0, source.length);
  const normalized = normalizeBody(node, source);
  
  assertEquals(normalized, "echo 'hello'\necho 'world'");
});

Deno.test("normalizeBody - preserves content structure", () => {
  const source = `{
    echo "line1"
    echo "line2"
  }`;
  
  const node = createMockNode(source, 0, source.length);
  const normalized = normalizeBody(node, source);
  
  assertEquals(normalized.includes("line1"), true);
  assertEquals(normalized.includes("line2"), true);
});

Deno.test("normalizeHereDoc - strips tabs when tabStripped is true", () => {
  const content = "\tcontent here\n\tmore content";
  const normalized = normalizeHereDoc(content, true);
  
  assertEquals(normalized, "content here\nmore content");
});

Deno.test("normalizeHereDoc - preserves content when tabStripped is false", () => {
  const content = "\tcontent here\n\tmore content";
  const normalized = normalizeHereDoc(content, false);
  
  assertEquals(normalized, content);
});

Deno.test("normalizeHereDoc - handles mixed tabs and spaces", () => {
  const content = "\t\tcontent\n\t  mixed";
  const normalized = normalizeHereDoc(content, true);
  
  assertEquals(normalized, "content\n  mixed");
});
