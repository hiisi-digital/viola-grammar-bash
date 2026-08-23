/**
 * Integration test for complete grammar definition.
 * 
 * Tests that all components work together correctly.
 * 
 * @module
 */

import { assertEquals, assert } from "./assert.ts";
import { bash } from "../mod.ts";
import type {
  QueryCaptures,
  SyntaxNode,
  TreeCursor,
} from "@hiisi/viola/grammars";

Deno.test("Grammar integration - exports complete definition", () => {
  // Verify meta is complete
  assertEquals(bash.meta.id, "bash");
  assertEquals(bash.meta.name, "Bash");
  assert(bash.meta.extensions);
  assertEquals(bash.meta.extensions.includes(".sh"), true);
  assertEquals(bash.meta.extensions.includes(".bash"), true);
  
  // Verify grammar source
  assertEquals(bash.grammar.source, "npm");
  assertEquals(bash.grammar.package, "tree-sitter-bash");
  assertEquals(bash.grammar.wasm, "tree-sitter-bash.wasm");
  
  // Verify queries exist
  assert(bash.queries);
  assert(bash.queries.functions);
  assert(bash.queries.strings);
  assert(bash.queries.imports);
  assert(bash.queries.exports);
  assert(bash.queries.docComments);
  
  // Verify transforms exist
  assert(bash.transforms);
  assert(bash.transforms.parseParams);
  assert(bash.transforms.normalizeBody);
  assert(bash.transforms.isExported);
  assert(bash.transforms.parseDocComment);
});

Deno.test("Grammar integration - queries are valid S-expressions", () => {
  // Verify queries contain expected patterns
  assertEquals(bash.queries.functions?.includes("function_definition"), true);
  assertEquals(bash.queries.functions?.includes("@function.name"), true);
  assertEquals(bash.queries.functions?.includes("@function.body"), true);
  
  assertEquals(bash.queries.strings?.includes("raw_string"), true);
  assertEquals(bash.queries.strings?.includes("string"), true);
  
  assertEquals(bash.queries.imports?.includes("source"), true);
  assertEquals(bash.queries.imports?.includes("@import.from"), true);
  
  assertEquals(bash.queries.exports?.includes("export"), true);
  assertEquals(bash.queries.exports?.includes("@export.name"), true);
  
  assertEquals(bash.queries.docComments?.includes("comment"), true);
  assertEquals(bash.queries.docComments?.includes("@doc.content"), true);
});

/**
 * A node with no children and no siblings.
 *
 * Spelled out in full because `SyntaxNode` is the whole tree-sitter surface
 * viola declares, and a partial literal stops compiling the moment that surface
 * grows. It grew, and this was a mock missing five of its properties.
 */
/** A cursor sitting on one node, which is as far as a leaf goes. */
function cursorOver(node: SyntaxNode): TreeCursor {
  return {
    nodeType: node.type,
    nodeText: node.text,
    nodeIsNamed: true,
    startPosition: node.startPosition,
    endPosition: node.endPosition,
    startIndex: node.startIndex,
    endIndex: node.endIndex,
    currentNode: node,
    currentFieldName: null,
    reset: () => {},
    gotoParent: () => false,
    gotoFirstChild: () => false,
    gotoFirstChildForIndex: () => false,
    gotoNextSibling: () => false,
  };
}

function leafNode(type: string, text: string): SyntaxNode {
  const node: SyntaxNode = {
    type,
    text,
    startPosition: { row: 0, column: 0 },
    endPosition: { row: 0, column: text.length },
    startIndex: 0,
    endIndex: text.length,
    parent: null,
    previousNamedSibling: null,
    nextNamedSibling: null,
    children: [],
    namedChildren: [],
    childCount: 0,
    namedChildCount: 0,
    hasError: false,
    isMissing: false,
    childForFieldName: () => null,
    child: () => null,
    namedChild: () => null,
    descendantForIndex: () => node,
    descendantsOfType: () => [],
    walk: () => cursorOver(node),
  };
  return node;
}

Deno.test("Grammar integration - transform functions are callable", () => {
  const mockNode = leafNode("compound_statement", "{ echo $1 }");
  
  const mockCaptures: QueryCaptures = {
    get: (name: string) => name === "function.name" ? { node: mockNode, text: "test" } : undefined,
    has: () => false,
    all: () => new Map(),
  };
  
  // Verify transforms can be called
  assert(bash.transforms?.parseParams);
  const params = bash.transforms.parseParams(mockNode, "{ echo $1 }");
  assert(Array.isArray(params));
  
  assert(bash.transforms?.normalizeBody);
  const body = bash.transforms.normalizeBody("  test  ", "bash");
  assertEquals(typeof body, "string");
  
  assert(bash.transforms?.isExported);
  const exported = bash.transforms.isExported(mockNode, mockCaptures);
  assertEquals(typeof exported, "boolean");
  
  assert(bash.transforms?.parseDocComment);
  const comment = bash.transforms.parseDocComment(mockNode, "# test");
  assertEquals(typeof comment, "string");
});
