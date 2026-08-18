import { RuleTester } from "oxlint/plugins-dev";

import { noSilentErrorSuppressionRule } from "../src/rules/no-silent-error-suppression.ts";

const tester = new RuleTester();
const catchError = { messageId: "catchClause" };
const promiseError = { messageId: "promiseCatch" };

tester.run("2h2d/no-silent-error-suppression", noSilentErrorSuppressionRule, {
  valid: [
    "try { operation(); } catch (cause) { throw cause; }",
    "try { operation(); } catch (cause) { if (isExpected(cause)) return; throw cause; }",
    "try { operation(); } catch (cause) { throw new Error('Operation failed', { cause }); }",
    "promise.catch((cause) => { throw cause; });",
    "promise.catch((cause) => Promise.reject(cause));",
    "promise['catch'](function (cause) { return Promise.reject(cause); });",
    "promise.catch(handleFailure);",
  ],
  invalid: [
    {
      code: "try { operation(); } catch {}",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { console.error(cause); }",
      errors: [catchError],
    },
    {
      code: "function load() { try { return operation(); } catch (cause) { log(cause); return []; } }",
      errors: [catchError],
    },
    {
      code: "promise.catch(() => {});",
      errors: [promiseError],
    },
    {
      code: "promise.catch((cause) => { console.error(cause); });",
      errors: [promiseError],
    },
    {
      code: "promise.catch(() => []);",
      errors: [promiseError],
    },
    {
      code: "promise['catch'](() => undefined);",
      errors: [promiseError],
    },
  ],
});
