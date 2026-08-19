import { RuleTester } from "oxlint/plugins-dev";

import { noSilentErrorSuppressionRule } from "../src/rules/no-silent-error-suppression.ts";

const tester = new RuleTester();
const catchError = { messageId: "catchClause" };
const promiseError = { messageId: "promiseCatch" };

tester.run("2h2d/no-silent-error-suppression", noSilentErrorSuppressionRule, {
  valid: [
    "try { operation(); } catch (cause) { throw cause; }",
    "try { operation(); } catch (cause) { if (isExpected(cause)) return; throw cause; }",
    "try { operation(); } catch (cause) { if (!isExpected(cause)) throw cause; return; }",
    "try { operation(); } catch (cause) { if (cause instanceof ExpectedError) return; throw cause; }",
    "try { operation(); } catch (cause) { if (isNodeError(cause) && cause.code === 'ENOENT') return; throw cause; }",
    "try { operation(); } catch (cause) { throw new Error('Operation failed', { cause }); }",
    "try { operation(); } catch (cause) { const error = normalize(cause); throw error; }",
    "try { operation(); } catch (cause) { switch (classify(cause)) { case 'expected': return; default: throw cause; } }",
    "try { operation(); } catch (cause) { console.error('Operation failed', cause); }",
    "try { operation(); } catch (cause) { diagnostics.push(normalize(cause)); return []; }",
    "try { operation(); } catch (cause) { onTransportDiagnostic({ cause }); return []; }",
    "try { operation(); } catch (cause) { const diagnostic = normalize(cause); return { ok: false, diagnostic }; }",
    "try { operation(); } catch (cause) { return { ok: false, error: normalize(cause) }; }",
    "promise.catch((cause) => { throw cause; });",
    "promise.catch((cause) => Promise.reject(cause));",
    "promise.catch((cause) => console.error(cause));",
    "promise['catch'](function (cause) { return Promise.reject(cause); });",
    "function handleFailure(cause) { throw cause; } promise.catch(handleFailure);",
    "const handleFailure = (cause) => Promise.reject(cause); promise.catch(handleFailure);",
    "function handleFailure(cause) { console.error(cause); } promise.catch(handleFailure);",
    "import { handleFailure } from './errors'; promise.catch(handleFailure);",
    "router.catch(handleRoute);",
  ],
  invalid: [
    {
      code: "try { operation(); } catch {}",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { void cause; }",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { Boolean(cause); }",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { normalize(cause); return []; }",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { errorToString(cause); return []; }",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { const ignored = Boolean(cause); return ignored; }",
      errors: [catchError],
    },
    {
      code: "function load() { try { return operation(); } catch (cause) { return []; } }",
      errors: [catchError],
    },
    {
      code: "function load() { try { return operation(); } catch (cause) { if (debug) throw cause; return []; } }",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { try { throw cause; } catch {} }",
      errors: 2,
    },
    {
      code: "try { operation(); } catch (cause) { throw new Error('Replacement'); }",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { if (cause === cause) return; throw cause; }",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { if (Boolean(cause)) return; throw cause; }",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { if (isExpected(cause) || debug) return; throw cause; }",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { if (!isExpected(cause) && debug) throw cause; return; }",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { for (const item of items) { if (item) return; } }",
      errors: [catchError],
    },
    {
      code: "try { operation(); } catch (cause) { if (debug) return; throw cause; }",
      errors: [catchError],
    },
    {
      code: "promise.catch(() => {});",
      errors: [promiseError],
    },
    {
      code: "promise.catch((cause) => Promise.reject('replacement'));",
      errors: [promiseError],
    },
    {
      code: "promise.catch((cause) => Boolean(cause));",
      errors: [promiseError],
    },
    {
      code: "promise.catch((cause) => isExpected(cause));",
      errors: [promiseError],
    },
    {
      code: "promise['catch'](() => undefined);",
      errors: [promiseError],
    },
  ],
});
