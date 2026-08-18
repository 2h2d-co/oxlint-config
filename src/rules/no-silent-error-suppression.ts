import { defineRule } from "@oxlint/plugins";
import type { ESTree } from "@oxlint/plugins";

function unwrapExpression(expression: ESTree.Expression): ESTree.Expression {
  let current = expression;
  while (current.type === "ParenthesizedExpression" || current.type === "ChainExpression") {
    current = current.expression;
  }
  return current;
}

function isPromiseRejectCall(expression: ESTree.Expression): boolean {
  const current = unwrapExpression(expression);
  if (current.type === "AwaitExpression") {
    return isPromiseRejectCall(current.argument);
  }
  if (current.type !== "CallExpression") return false;

  const callee = unwrapExpression(current.callee);
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    callee.object.name === "Promise" &&
    callee.property.name === "reject"
  );
}

function statementPropagatesFailure(statement: ESTree.Statement): boolean {
  switch (statement.type) {
    case "ThrowStatement":
      return true;
    case "ReturnStatement":
      return statement.argument !== null && isPromiseRejectCall(statement.argument);
    case "BlockStatement":
      return statementsPropagateFailure(statement.body);
    case "IfStatement":
      return (
        statementPropagatesFailure(statement.consequent) ||
        (statement.alternate !== null && statementPropagatesFailure(statement.alternate))
      );
    case "DoWhileStatement":
    case "ForInStatement":
    case "ForOfStatement":
    case "ForStatement":
    case "LabeledStatement":
    case "WhileStatement":
    case "WithStatement":
      return statementPropagatesFailure(statement.body);
    case "SwitchStatement":
      return statement.cases.some((switchCase) =>
        statementsPropagateFailure(switchCase.consequent),
      );
    case "TryStatement":
      return (
        statementsPropagateFailure(statement.block.body) ||
        (statement.handler !== null && statementsPropagateFailure(statement.handler.body.body)) ||
        (statement.finalizer !== null && statementsPropagateFailure(statement.finalizer.body))
      );
    default:
      return false;
  }
}

function statementsPropagateFailure(statements: ESTree.Statement[]): boolean {
  return statements.some(statementPropagatesFailure);
}

function isCatchMethod(expression: ESTree.Expression): boolean {
  const callee = unwrapExpression(expression);
  if (callee.type !== "MemberExpression") return false;

  if (callee.computed) {
    return callee.property.type === "Literal" && callee.property.value === "catch";
  }
  return callee.property.name === "catch";
}

function rejectionCallbackPropagatesFailure(callback: ESTree.Expression): boolean {
  if (callback.type === "ArrowFunctionExpression") {
    return callback.body.type === "BlockStatement"
      ? statementsPropagateFailure(callback.body.body)
      : isPromiseRejectCall(callback.body);
  }
  if (callback.type !== "FunctionExpression" || callback.body === null) return true;
  return statementsPropagateFailure(callback.body.body);
}

/** Require caught failures to be propagated unless expected failures are explicitly classified. */
export const noSilentErrorSuppressionRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow catch handlers and inline Promise rejection callbacks that cannot propagate unexpected failures.",
    },
    messages: {
      catchClause:
        "This catch handler cannot propagate an unexpected failure. Explicitly classify expected failures and throw every other cause.",
      promiseCatch:
        "This Promise rejection callback cannot propagate an unexpected failure. Explicitly classify expected failures and reject or throw every other cause.",
    },
  },
  createOnce(context) {
    return {
      CatchClause(node) {
        if (!statementsPropagateFailure(node.body.body)) {
          context.report({ node, messageId: "catchClause" });
        }
      },
      CallExpression(node) {
        if (!isCatchMethod(node.callee)) return;

        const callback = node.arguments[0];
        if (
          callback !== undefined &&
          callback.type !== "SpreadElement" &&
          !rejectionCallbackPropagatesFailure(callback)
        ) {
          context.report({ node: callback, messageId: "promiseCatch" });
        }
      },
    };
  },
});
