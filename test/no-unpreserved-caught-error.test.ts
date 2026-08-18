import { RuleTester } from "oxlint/plugins-dev";

import { noUnpreservedCaughtErrorRule } from "../src/rules/no-unpreserved-caught-error.ts";

const tester = new RuleTester();
const error = { messageId: "missingCause" };

tester.run("2h2d/no-unpreserved-caught-error", noUnpreservedCaughtErrorRule, {
  valid: [
    "try { operation(); } catch {}",
    "try { operation(); } catch { throw existingError; }",
    "try { operation(); } catch (cause) { throw new Error('Failed', { cause }); }",
    "try { operation(); } catch { throw new CustomError('Failed'); }",
    "try { operation(); } catch { function later() { throw new Error('Failed'); } }",
    "const Error = CustomError; try { operation(); } catch { throw new Error('Failed'); }",
  ],
  invalid: [
    {
      code: "try { operation(); } catch { throw new Error('Failed'); }",
      errors: [error],
    },
    {
      code: "try { operation(); } catch { throw TypeError('Failed'); }",
      errors: [error],
    },
    {
      code: "try { operation(); } catch { throw new AggregateError([], 'Failed'); }",
      errors: [error],
    },
  ],
});
