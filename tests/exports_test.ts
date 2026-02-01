/**
 * Tests for Bash export detection.
 * 
 * @module
 */

import { assertEquals } from "./assert.ts";
import { isExported } from "../src/transforms/exports.ts";

Deno.test("isExported - detects exported function", () => {
  const source = `
function greet() {
  echo "hello"
}
export -f greet
  `;
  
  assertEquals(isExported("greet", source), true);
});

Deno.test("isExported - returns false for non-exported function", () => {
  const source = `
function greet() {
  echo "hello"
}
  `;
  
  assertEquals(isExported("greet", source), false);
});

Deno.test("isExported - handles multiple exports", () => {
  const source = `
function foo() { echo "foo"; }
function bar() { echo "bar"; }
export -f foo
export -f bar
  `;
  
  assertEquals(isExported("foo", source), true);
  assertEquals(isExported("bar", source), true);
});

Deno.test("isExported - handles export with extra whitespace", () => {
  const source = `
function test() { echo "test"; }
export   -f   test
  `;
  
  assertEquals(isExported("test", source), true);
});

Deno.test("isExported - does not match partial names", () => {
  const source = `
function test() { echo "test"; }
function testing() { echo "testing"; }
export -f test
  `;
  
  assertEquals(isExported("test", source), true);
  assertEquals(isExported("testing", source), false);
});
