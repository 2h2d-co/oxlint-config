import { RuleTester } from "oxlint/plugins-dev";

import { noUnreviewedSuppressionDirectivesRule } from "../src/rules/no-unreviewed-suppression-directives.ts";

const tester = new RuleTester();

tester.run("2h2d/no-unreviewed-suppression-directives", noUnreviewedSuppressionDirectivesRule, {
  valid: [
    "const value = 1;",
    "// oxlint-disable-next-line no-await-in-loop -- protocol operations must remain ordered.\nawait operation();",
    "operation(); // eslint-disable-line no-console -- the command intentionally writes progress.",
    "/*\n * oxlint-disable-next-line typescript/no-unsafe-call -- the external callback has no published type.\n */\ncallback();",
    "// @ts-check\nconst value = 1;",
  ],
  invalid: [
    {
      code: "// @ts-ignore\nconst value = external;",
      errors: [{ messageId: "typescript" }],
    },
    {
      code: "// @ts-expect-error -- upstream types are incomplete\nconst value = external;",
      errors: [{ messageId: "typescript" }],
    },
    {
      code: "// @ts-nocheck\nconst value = external;",
      errors: [{ messageId: "typescript" }],
    },
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
  ],
});
