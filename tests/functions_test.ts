/**
 * Tests for Bash function extraction queries.
 * 
 * @module
 */

import { assertEquals } from "./assert.ts";
import { functionsQuery } from "../src/queries/functions.ts";

Deno.test("functionsQuery - contains function definition patterns", () => {
  // Verify the query includes necessary patterns
  assertEquals(typeof functionsQuery, "string");
  assertEquals(functionsQuery.includes("function_definition"), true);
  assertEquals(functionsQuery.includes("@function.name"), true);
  assertEquals(functionsQuery.includes("@function.body"), true);
});
