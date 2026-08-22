import { defineRule } from "@oxlint/plugins";

type LintDirective = {
  action: string;
  remainder: string;
};

function normalizeCommentLine(line: string): string {
  return line.trim().replace(/^\*\s*/u, "");
}

function parseLintDirective(line: string): LintDirective | null {
  const match = /^(?:oxlint|eslint)-(disable-next-line|disable-line|disable|enable)\b(.*)$/u.exec(
    line,
  );
  if (match === null) return null;

  const action = match[1];
  const remainder = match[2];
  if (action === undefined || remainder === undefined) return null;

  return { action, remainder: remainder.trim() };
}

function hasExactlyOneRule(targets: string): boolean {
  return targets.length > 0 && !/[\s,]/u.test(targets);
}

/** Require every lint suppression to be narrow, specific, and explained. */
export const noUnreviewedSuppressionDirectivesRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Require lint suppressions to target one rule on one line with an explanation.",
    },
    messages: {
      broad:
        "Range-wide lint suppression is prohibited. Use a same-line or next-line directive for exactly one rule.",
      explanation: "Lint suppression directives require a specific explanation after `--`.",
      oneRule: "Lint suppression directives must name exactly one rule.",
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          for (const rawLine of comment.value.split("\n")) {
            const line = normalizeCommentLine(rawLine);
            const directive = parseLintDirective(line);
            if (directive === null) continue;

            if (directive.action === "disable" || directive.action === "enable") {
              context.report({ node: comment, messageId: "broad" });
              continue;
            }

            const separatorIndex = directive.remainder.indexOf("--");
            const targets =
              separatorIndex === -1
                ? directive.remainder
                : directive.remainder.slice(0, separatorIndex).trim();
            if (!hasExactlyOneRule(targets)) {
              context.report({ node: comment, messageId: "oneRule" });
              continue;
            }

            const explanation =
              separatorIndex === -1
                ? ""
                : directive.remainder.slice(separatorIndex + "--".length).trim();
            if (explanation.length === 0) {
              context.report({ node: comment, messageId: "explanation" });
            }
          }
        }
      },
    };
  },
});
