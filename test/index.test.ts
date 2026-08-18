import assert from "node:assert/strict";
import test from "node:test";
import { createMessage } from "../src/index.ts";

void test("createMessage returns a greeting", () => {
  assert.equal(createMessage("oxlint-config"), "Hello, oxlint-config!");
});
