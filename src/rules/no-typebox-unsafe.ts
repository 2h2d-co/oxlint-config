import { defineRule } from "@oxlint/plugins";

import type { ESTree, Scope, SourceCode, Variable } from "@oxlint/plugins";

type TypeboxBinding = "default" | "namespace" | "type" | "unsafe";

function resolveVariable(
  sourceCode: SourceCode,
  identifier: ESTree.IdentifierReference,
): Variable | null {
  let scope: Scope | null = sourceCode.getScope(identifier);
  while (scope !== null) {
    const variable = scope.set.get(identifier.name);
    if (variable !== undefined) return variable;
    scope = scope.upper;
  }
  return null;
}

function importedName(node: ESTree.Node): string | null {
  if (node.type !== "ImportSpecifier") return null;
  return node.imported.type === "Identifier" ? node.imported.name : node.imported.value;
}

function typeboxBinding(
  sourceCode: SourceCode,
  identifier: ESTree.IdentifierReference,
): TypeboxBinding | null {
  const variable = resolveVariable(sourceCode, identifier);
  if (variable === null) return null;

  for (const definition of variable.defs) {
    if (
      definition.type !== "ImportBinding" ||
      definition.parent?.type !== "ImportDeclaration" ||
      definition.parent.source.value !== "typebox"
    ) {
      continue;
    }
    if (definition.node.type === "ImportDefaultSpecifier") return "default";
    if (definition.node.type === "ImportNamespaceSpecifier") return "namespace";
    const name = importedName(definition.node);
    if (name === "Type") return "type";
    if (name === "Unsafe") return "unsafe";
  }
  return null;
}

function memberName(expression: ESTree.Expression): string | null {
  if (expression.type !== "MemberExpression") return null;
  if (!expression.computed) {
    return expression.property.type === "Identifier" ? expression.property.name : null;
  }
  return expression.property.type === "Literal" && typeof expression.property.value === "string"
    ? expression.property.value
    : null;
}

function isTypeboxUnsafeCall(sourceCode: SourceCode, callee: ESTree.Expression): boolean {
  if (callee.type === "Identifier") {
    return typeboxBinding(sourceCode, callee) === "unsafe";
  }
  if (memberName(callee) !== "Unsafe" || callee.type !== "MemberExpression") return false;

  const receiver = callee.object;
  if (receiver.type === "Identifier") {
    const binding = typeboxBinding(sourceCode, receiver);
    return binding === "default" || binding === "namespace" || binding === "type";
  }
  if (
    memberName(receiver) !== "Type" ||
    receiver.type !== "MemberExpression" ||
    receiver.object.type !== "Identifier"
  ) {
    return false;
  }
  return typeboxBinding(sourceCode, receiver.object) === "namespace";
}

/** Require static types to be derived from their TypeBox runtime schemas. */
export const noTypeboxUnsafeRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow TypeBox Unsafe schemas; prefer builders, then static types derived from const native JSON Schema.",
    },
    messages: {
      typeboxUnsafe:
        "Type.Unsafe manually pairs a static type with a runtime schema. Prefer TypeBox builders; otherwise use const native JSON Schema and derive its type with Static<typeof schema>. Suppress only when neither can express the invariant.",
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (isTypeboxUnsafeCall(context.sourceCode, node.callee)) {
          context.report({ node, messageId: "typeboxUnsafe" });
        }
      },
    };
  },
});
