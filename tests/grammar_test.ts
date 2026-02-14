/**
 * Real tree-sitter parsing tests for the Bash grammar.
 *
 * These tests parse actual Bash source through tree-sitter and verify
 * extraction results. They validate that queries match real tree-sitter
 * node structures and that transforms produce correct data.
 */

import { assertEquals, assertExists } from "@std/assert";
import { bash } from "../mod.ts";
import {
  createParser,
  extractFileData,
  initTreeSitter,
  loadGrammar,
  queryAll,
  type Language,
  type Parser,
} from "@hiisi/viola/grammars";

// Import tree-sitter-bash so Deno caches the npm package (needed for WASM loading)
import "tree-sitter-bash";

// =============================================================================
// Setup
// =============================================================================

let parser: Parser;
let language: Language;
let ready = false;

async function setup(): Promise<void> {
  if (ready) return;
  await initTreeSitter();
  language = await loadGrammar(bash.grammar);
  parser = createParser(bash.grammar, language);
  ready = true;
}

async function extract(source: string, filePath = "test.sh") {
  await setup();
  const tree = parser.parse(source);
  return extractFileData(tree, language, bash, filePath, source);
}

async function queryCaptures(queryStr: string, source: string) {
  await setup();
  const tree = parser.parse(source);
  return [...queryAll(tree, language, queryStr, source)];
}

// =============================================================================
// Function Extraction
// =============================================================================

Deno.test("functions - POSIX style function", async () => {
  const data = await extract(`
greet() {
  echo "hello"
}
`);
  assertEquals(data.functions.length, 1);
  assertEquals(data.functions[0]!.name, "greet");
});

Deno.test("functions - keyword style function", async () => {
  const data = await extract(`
function greet() {
  echo "hello"
}
`);
  assertEquals(data.functions.length, 1);
  assertEquals(data.functions[0]!.name, "greet");
});

Deno.test("functions - keyword without parens", async () => {
  const data = await extract(`
function greet {
  echo "hello"
}
`);
  assertEquals(data.functions.length, 1);
  assertEquals(data.functions[0]!.name, "greet");
});

Deno.test("functions - multiple functions extracted", async () => {
  const data = await extract(`
foo() { echo "foo"; }
bar() { echo "bar"; }
baz() { echo "baz"; }
`);
  const names = data.functions.map(f => f.name);
  assertEquals(names.length, 3);
  assertEquals(names.includes("foo"), true);
  assertEquals(names.includes("bar"), true);
  assertEquals(names.includes("baz"), true);
});

Deno.test("functions - function with body content", async () => {
  const data = await extract(`
process_files() {
  for f in "$@"; do
    echo "Processing $f"
  done
}
`);
  assertEquals(data.functions.length, 1);
  const fn = data.functions[0]!;
  assertEquals(fn.name, "process_files");
  assertEquals(fn.body.includes("for f"), true, "Body should contain the for loop");
});

// =============================================================================
// Parameter Extraction (via transforms)
// =============================================================================

Deno.test("params - simple positional parameters", async () => {
  const data = await extract(`
greet() {
  local name="$1"
  echo "Hello, $name"
}
`);
  assertEquals(data.functions.length, 1);
  const params = data.functions[0]!.params;
  assertEquals(params.length, 1);
  assertEquals(params[0]!.name, "$1");
  assertEquals(params[0]!.rest, false);
});

Deno.test("params - multiple positional parameters", async () => {
  const data = await extract(`
add() {
  echo $(( $1 + $2 ))
}
`);
  const params = data.functions[0]!.params;
  assertEquals(params.length, 2);
  assertEquals(params[0]!.name, "$1");
  assertEquals(params[1]!.name, "$2");
});

Deno.test("params - parameter with default value", async () => {
  const data = await extract(
    'greet() {\n  local greeting="${1:-Hello}"\n  echo "$greeting"\n}\n'
  );
  const params = data.functions[0]!.params;
  assertEquals(params.length, 1);
  assertEquals(params[0]!.name, "$1");
  assertEquals(params[0]!.optional, true);
  assertEquals(params[0]!.defaultValue, "Hello");
});

Deno.test("params - rest parameter ($@)", async () => {
  const data = await extract(`
log_all() {
  for arg in "$@"; do
    echo "$arg"
  done
}
`);
  const params = data.functions[0]!.params;
  // Should have the $@ rest param
  const restParam = params.find(p => p.rest);
  assertExists(restParam, "Should detect $@ rest parameter");
  assertEquals(restParam.name, "$@");
  assertEquals(restParam.rest, true);
});

Deno.test("params - no parameters detected in simple function", async () => {
  const data = await extract(`
print_date() {
  date +%Y-%m-%d
}
`);
  assertEquals(data.functions[0]!.params.length, 0);
});

// =============================================================================
// String Extraction
// =============================================================================

Deno.test("strings - double-quoted string", async () => {
  const data = await extract(`echo "hello world"`);
  assertEquals(data.strings.length >= 1, true, "Should find at least one string");
  const values = data.strings.map(s => s.value);
  // The string might include quotes depending on extractor
  const found = values.some(v => v.includes("hello world"));
  assertEquals(found, true, "Should find 'hello world'");
});

Deno.test("strings - single-quoted string", async () => {
  const data = await extract(`echo 'hello world'`);
  assertEquals(data.strings.length >= 1, true, "Should find at least one string");
});

Deno.test("strings - here-document", async () => {
  const data = await extract(`
cat <<EOF
This is a here-document
with multiple lines
EOF
`);
  assertEquals(data.strings.length >= 1, true, "Should find at least one string from here-doc");
});

// =============================================================================
// Export Extraction
// =============================================================================

Deno.test("exports - export variable", async () => {
  const data = await extract(`export MY_VAR="hello"`);
  assertEquals(data.exports.length >= 1, true, "Should find export");
  const names = data.exports.map(e => e.name);
  // export MY_VAR="hello" — the capture might be MY_VAR="hello" or just MY_VAR
  const found = names.some(n => n.startsWith("MY_VAR"));
  assertEquals(found, true, "Should find MY_VAR export");
});

Deno.test("exports - export -f function", async () => {
  const data = await extract(`
greet() { echo "hi"; }
export -f greet
`);
  const names = data.exports.map(e => e.name);
  assertEquals(names.includes("greet"), true, "Should find exported function name");
});

Deno.test("exports - declare -x variable", async () => {
  const data = await extract(`declare -x PATH="/usr/bin"`);
  assertEquals(data.exports.length >= 1, true, "Should find declare -x export");
});

// =============================================================================
// Import Extraction
// =============================================================================

Deno.test("imports - source command", async () => {
  const data = await extract(`source ./lib/utils.sh`);
  assertEquals(data.imports.length >= 1, true, "Should find source import");
});

Deno.test("imports - dot command", async () => {
  const data = await extract(`. ./lib/utils.sh`);
  assertEquals(data.imports.length >= 1, true, "Should find dot import");
});

// =============================================================================
// isExported Transform
// =============================================================================

Deno.test("isExported - function with export -f is marked exported", async () => {
  const data = await extract(`
my_func() {
  echo "hello"
}
export -f my_func
`);
  const fn = data.functions.find(f => f.name === "my_func");
  assertExists(fn, "Should find my_func");
  assertEquals(fn.isExported, true, "Function should be marked as exported");
});

Deno.test("isExported - function without export -f is not exported", async () => {
  const data = await extract(`
my_func() {
  echo "hello"
}
`);
  const fn = data.functions.find(f => f.name === "my_func");
  assertExists(fn, "Should find my_func");
  assertEquals(fn.isExported, false, "Function should NOT be marked as exported");
});

// =============================================================================
// Query Compilation
// =============================================================================

Deno.test("queries - functions query compiles", async () => {
  const captures = await queryCaptures(bash.queries.functions, `
foo() { echo "test"; }
`);
  assertEquals(captures.length >= 1, true, "Function query should produce captures");
});

Deno.test("queries - exports query compiles", async () => {
  const captures = await queryCaptures(bash.queries.exports!, `
export MY_VAR="test"
`);
  assertEquals(captures.length >= 1, true, "Export query should produce captures");
});

Deno.test("queries - imports query compiles", async () => {
  const captures = await queryCaptures(bash.queries.imports!, `
source ./test.sh
`);
  assertEquals(captures.length >= 1, true, "Import query should produce captures");
});

Deno.test("queries - strings query compiles", async () => {
  const captures = await queryCaptures(bash.queries.strings!, `
echo "hello"
`);
  assertEquals(captures.length >= 1, true, "String query should produce captures");
});

// =============================================================================
// Integration
// =============================================================================

Deno.test("integration - realistic bash script extraction", async () => {
  const source = [
    "#!/bin/bash",
    "# Utility functions for project management",
    "",
    "source ./lib/config.sh",
    "",
    'export PROJECT_NAME="myproject"',
    "",
    "# Build the project",
    "build() {",
    '  local target="${1:-release}"',
    '  echo "Building $target..."',
    '  make "$target"',
    "}",
    "",
    "# Deploy to server",
    "deploy() {",
    '  local server="$1"',
    '  local port="${2:-22}"',
    '  scp -P "$port" build/* "$server:/opt/app/"',
    "}",
    "",
    "export -f build",
    "",
    "run_tests() {",
    '  for test_file in "$@"; do',
    '    bash "$test_file"',
    "  done",
    "}",
  ].join("\n");
  const data = await extract(source);

  // Functions
  const funcNames = data.functions.map(f => f.name);
  assertEquals(funcNames.includes("build"), true, "Should extract build function");
  assertEquals(funcNames.includes("deploy"), true, "Should extract deploy function");
  assertEquals(funcNames.includes("run_tests"), true, "Should extract run_tests function");

  // build() should be marked exported (export -f build)
  const buildFn = data.functions.find(f => f.name === "build");
  assertExists(buildFn, "Should find build function");
  assertEquals(buildFn.isExported, true, "build should be exported");

  // deploy() should NOT be exported
  const deployFn = data.functions.find(f => f.name === "deploy");
  assertExists(deployFn, "Should find deploy function");
  assertEquals(deployFn.isExported, false, "deploy should not be exported");

  // Parameter extraction
  assertEquals(buildFn.params.length >= 1, true, "build should have at least 1 param");
  const buildParam = buildFn.params[0]!;
  assertEquals(buildParam.name, "$1");
  assertEquals(buildParam.optional, true, "build's $1 has default 'release'");

  assertEquals(deployFn.params.length >= 2, true, "deploy should have at least 2 params");

  // run_tests should have $@ rest param
  const runTestsFn = data.functions.find(f => f.name === "run_tests");
  assertExists(runTestsFn);
  const restParam = runTestsFn.params.find(p => p.rest);
  assertExists(restParam, "run_tests should have rest parameter");

  // Exports
  assertEquals(data.exports.length >= 1, true, "Should find exports");

  // Strings
  assertEquals(data.strings.length >= 1, true, "Should find string literals");
});
