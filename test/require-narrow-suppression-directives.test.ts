import { RuleTester } from "oxlint/plugins-dev";

import { requireNarrowSuppressionDirectivesRule } from "../src/rules/require-narrow-suppression-directives.ts";

const tester = new RuleTester();

tester.run("2h2d/require-narrow-suppression-directives", requireNarrowSuppressionDirectivesRule, {
  valid: [
    "const value = 1;",
    "// oxlint-disable-next-line no-await-in-loop -- protocol operations must remain ordered.\nawait operation();",
    "operation(); // eslint-disable-line no-console -- the command intentionally writes progress.",
    "/*\n * oxlint-disable-next-line typescript/no-unsafe-call -- the external callback has no published type.\n */\ncallback();",
    "// oxlint-disable-next-line no-console -- 1234567890\nconsole.log(value);",
    "// @ts-check\nconst value = 1;",
    "// @ts-expect-error: invalid input is intentional in this negative type test.\nacceptsString(123);",
  ],
  invalid: [
    {
      code: "// oxlint-disable\nconst value = external;",
      errors: [{ messageId: "broad" }],
    },
    {
      code: "// eslint-disable-next-line\nconst value = external;",
      errors: [{ messageId: "oneRule" }],
    },
    {
      code: "// oxlint-disable-next-line no-console, no-debugger -- temporary debugging\nconsole.log(value);",
      errors: [{ messageId: "oneRule" }],
    },
    {
      code: "// oxlint-disable-next-line no-console\nconsole.log(value);",
      errors: [{ messageId: "explanation" }],
    },
    {
      code: "console.log(value); // eslint-disable-line no-console --",
      errors: [{ messageId: "explanation" }],
    },
    {
      code: "console.log(value); // eslint-disable-line no-console -- because",
      errors: [{ messageId: "explanation" }],
    },
  ],
});
