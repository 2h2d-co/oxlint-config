import { RuleTester } from "oxlint/plugins-dev";

import { noModuleMockingRule } from "../src/rules/no-module-mocking.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "moduleMock" };

tester.run("2h2d/no-module-mocking", noModuleMockingRule, {
  valid: [
    "const store = new InMemoryUserStore();",
    "vi.spyOn(store, 'save');",
    "const vi = { mock() {} }; vi.mock();",
    "const vitest = { mock() {} }; vitest.mock();",
    "function test(jest: { mock(): void }) { jest.mock(); }",
    "import { vi as localVi } from './helpers'; localVi.mock('./module');",
  ],
  invalid: [
    { code: "vi.mock('./user-store');", errors: [error] },
    { code: "jest.mock('./user-store');", errors: [error] },
    { code: "vi['doMock']('./user-store');", errors: [error] },
    { code: "jest.unstable_mockModule('./user-store');", errors: [error] },
    { code: "import { vi } from 'vitest'; vi.mock('./user-store');", errors: [error] },
    {
      code: "import { vi as testApi } from 'vitest'; testApi.mock('./user-store');",
      errors: [error],
    },
    {
      code: "import { vi as testApi } from 'vitest'; testApi['doMock']('./user-store');",
      errors: [error],
    },
    {
      code: "import { vitest } from 'vitest'; vitest.mock('./user-store');",
      errors: [error],
    },
    {
      code: "import { vitest as testApi } from 'vitest'; testApi['doMock']('./user-store');",
      errors: [error],
    },
    {
      code: "import { jest } from '@jest/globals'; jest.mock('./user-store');",
      errors: [error],
    },
    {
      code: "import { jest as testApi } from '@jest/globals'; testApi['unstable_mockModule']('./user-store');",
      errors: [error],
    },
  ],
});
