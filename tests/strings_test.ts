/**
 * Tests for string extraction queries.
 * 
 * @module
 */

import { assertEquals } from "./assert.ts";
import { stringsQuery } from "../src/queries/strings.ts";

Deno.test("stringsQuery - contains string patterns", () => {
  assertEquals(typeof stringsQuery, "string");
  assertEquals(stringsQuery.includes("raw_string"), true);
  assertEquals(stringsQuery.includes("string"), true);
  assertEquals(stringsQuery.includes("@string.value"), true);
});
