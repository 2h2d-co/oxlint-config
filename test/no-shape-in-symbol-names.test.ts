import { RuleTester } from "oxlint/plugins-dev";

import { noForbiddenTermInSymbolNamesRule } from "../src/rules/no-shape-in-symbol-names.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "forbiddenSymbolName" };

tester.run("2h2d/no-shape-in-symbol-names", noForbiddenTermInSymbolNamesRule, {
  valid: ["interface UserRecord { readonly id: string }", "const expectedPathSignature = value;"],
  invalid: [
    { code: "interface UserShape { readonly id: string }", errors: [error] },
    { code: "const expectedShape = value;", errors: [error] },
    { code: "const value = schema.shape;", errors: [error] },
    { code: "function reshape() {}", errors: [error] },
  ],
});
