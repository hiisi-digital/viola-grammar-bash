/**
 * Integration test for complete grammar definition.
 * 
 * Tests that all components work together correctly.
 * 
 * @module
 */

import { assertEquals, assert } from "./assert.ts";
import { bash } from "../mod.ts";

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
  assert(bash.transforms.parseImport);
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

Deno.test("Grammar integration - transform functions are callable", () => {
  // Create mock nodes for testing
  const mockNode = {
    type: "compound_statement",
    startIndex: 0,
    endIndex: 10,
    children: [],
    namedChildren: [],
    text: "test",
  };
  
  // Verify transforms can be called
  assert(bash.transforms?.parseParams);
  const params = bash.transforms.parseParams(mockNode, "{ echo $1 }");
  assert(Array.isArray(params));
  
  assert(bash.transforms?.normalizeBody);
  const body = bash.transforms.normalizeBody(mockNode, "  test  ");
  assertEquals(typeof body, "string");
  
  assert(bash.transforms?.isExported);
  const exported = bash.transforms.isExported("test", "export -f test");
  assertEquals(typeof exported, "boolean");
  
  assert(bash.transforms?.parseImport);
  const importPath = bash.transforms.parseImport(mockNode, "source ./test.sh");
  assertEquals(typeof importPath === "string" || importPath === undefined, true);
  
  assert(bash.transforms?.parseDocComment);
  const comment = bash.transforms.parseDocComment(mockNode, "# test");
  assertEquals(typeof comment, "string");
});
