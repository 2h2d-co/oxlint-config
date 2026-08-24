import { RuleTester } from "oxlint/plugins-dev";

import { requirePromiseRejectionParameterRule } from "../src/rules/require-promise-rejection-parameter.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "missingParameter" };

tester.run("2h2d/require-promise-rejection-parameter", requirePromiseRejectionParameterRule, {
  valid: [
    "promise.catch();",
    "promise.catch(undefined);",
    "promise.catch(null);",
    "promise.catch((error) => report(error));",
    "promise.catch(async (error) => report(error));",
    "promise.catch(function (error) { report(error); });",
    "promise.catch(function (this: Context, error) { report(error); });",
    "promise.catch((...errors) => report(errors));",
    "promise.then(onFulfilled);",
    "promise.then(onFulfilled, undefined);",
    "promise.then(onFulfilled, (error) => report(error));",
    "promise.finally(() => cleanup());",
    "function handle(error: unknown) { report(error); } promise.catch(handle);",
    "const handle = (error: unknown) => report(error); promise.catch(handle);",
    "import { handle } from './errors'; promise.catch(handle);",
    "promise.catch(condition ? handleLeft : handleRight);",
    "promise.catch(...handlers);",
    "promise.then(...handlers);",
  ],
  invalid: [
    { code: "promise.catch(() => {});", errors: [error] },
    { code: "promise.catch(async () => cleanup());", errors: [error] },
    { code: "promise.catch(function () {});", errors: [error] },
    {
      code: "promise.catch(function (this: Context) {});",
      errors: [error],
    },
    { code: "promise['catch'](() => fallback);", errors: [error] },
    { code: "promise?.catch?.(() => fallback);", errors: [error] },
    {
      code: "promise.then(onFulfilled, () => fallback);",
      errors: [error],
    },
    {
      code: "function ignore() {}\npromise.catch(ignore);",
      errors: [{ ...error, line: 2, column: 14, endLine: 2, endColumn: 20 }],
    },
    {
      code: "const ignore = () => undefined;\npromise.catch(ignore);",
      errors: [{ ...error, line: 2, column: 14, endLine: 2, endColumn: 20 }],
    },
    {
      code: "const ignore = function () {};\npromise.then(onFulfilled, ignore);",
      errors: [{ ...error, line: 2, column: 26, endLine: 2, endColumn: 32 }],
    },
    {
      code: "promise.catch(condition ? () => fallback : handle);",
      errors: [error],
    },
    {
      code: "promise.catch(left || (() => fallback));",
      errors: [error],
    },
    {
      code: "promise.catch((sideEffect(), () => fallback));",
      errors: [error],
    },
    {
      code: "promise.catch(condition ? () => left : () => right);",
      errors: [error, error],
    },
  ],
});
