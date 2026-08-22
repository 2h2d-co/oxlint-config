import { defineRule } from "@oxlint/plugins";

import type { ESTree, SourceCode } from "@oxlint/plugins";

import { resolveLexicalTypeBinding } from "../shared/lexical-type-bindings.ts";
import { lexicalTypeParameterNames } from "../shared/lexical-type-parameters.ts";

type Parameter = ESTree.ParamPattern;
type ParameterOwner =
  | ESTree.ArrowFunctionExpression
  | ESTree.Function
  | ESTree.TSCallSignatureDeclaration
  | ESTree.TSConstructSignatureDeclaration
  | ESTree.TSConstructorType
  | ESTree.TSFunctionType
  | ESTree.TSMethodSignature;

function parameterAnnotation(parameter: Parameter): ESTree.TSTypeAnnotation | null | undefined {
  if (parameter.type === "TSParameterProperty") {
    return parameterAnnotation(parameter.parameter);
  }
  if (parameter.type === "RestElement") {
    return parameter.typeAnnotation ?? parameterAnnotation(parameter.argument);
  }
  if (parameter.type === "AssignmentPattern") {
    return parameter.typeAnnotation ?? parameter.left.typeAnnotation;
  }
  return parameter.typeAnnotation;
}

function parameterName(parameter: Parameter, sourceCode: SourceCode): string {
  return parameter.type === "Identifier"
    ? parameter.name
    : sourceCode.getText(parameter).replace(/\s*:\s*object\s*$/u, "");
}

/** Ban the broad object type on function inputs, including local aliases to object. */
export const noObjectParametersRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow broad object function parameters; use a specific input contract or a generic object constraint.",
    },
    messages: {
      objectParameter:
        "Parameter `{{parameter}}` uses the broad `object` contract. Use a specific input type or a generic constrained by `object`; suppress this rule when any non-primitive is the exact API.",
    },
  },
  createOnce(context) {
    const resolvesToTopType = (
      type: ESTree.TSType,
      shadowedAliases: ReadonlySet<string>,
      visited = new Set<string>(),
    ): "any" | "unknown" | null => {
      if (type.type === "TSAnyKeyword") return "any";
      if (type.type === "TSUnknownKeyword") return "unknown";
      if (type.type === "TSParenthesizedType") {
        return resolvesToTopType(type.typeAnnotation, shadowedAliases, visited);
      }
      if (
        type.type !== "TSTypeReference" ||
        type.typeName.type !== "Identifier" ||
        (type.typeArguments !== null &&
          type.typeArguments !== undefined &&
          type.typeArguments.params.length > 0) ||
        visited.has(type.typeName.name) ||
        shadowedAliases.has(type.typeName.name)
      ) {
        return null;
      }
      const binding = resolveLexicalTypeBinding(type.typeName.name, type);
      if (
        binding?.kind !== "alias" ||
        (binding.declaration.typeParameters !== null &&
          binding.declaration.typeParameters !== undefined)
      ) {
        return null;
      }
      const nextVisited = new Set(visited);
      nextVisited.add(type.typeName.name);
      return resolvesToTopType(binding.declaration.typeAnnotation, shadowedAliases, nextVisited);
    };

    const isIntersectionNeutral = (
      type: ESTree.TSType,
      shadowedAliases: ReadonlySet<string>,
    ): boolean => {
      if (resolvesToTopType(type, shadowedAliases) === "unknown") return true;
      if (type.type === "TSParenthesizedType") {
        return isIntersectionNeutral(type.typeAnnotation, shadowedAliases);
      }
      return type.type === "TSTypeLiteral" && type.members.length === 0;
    };

    const resolvesToObject = (
      type: ESTree.TSType,
      shadowedAliases: ReadonlySet<string>,
      visited = new Set<string>(),
    ): boolean => {
      if (type.type === "TSObjectKeyword") return true;
      if (type.type === "TSParenthesizedType")
        return resolvesToObject(type.typeAnnotation, shadowedAliases, visited);
      if (type.type === "TSUnionType") {
        if (type.types.some((member) => resolvesToTopType(member, shadowedAliases) !== null)) {
          return false;
        }
        return type.types.some((member) => resolvesToObject(member, shadowedAliases, visited));
      }
      if (type.type === "TSIntersectionType") {
        if (type.types.some((member) => resolvesToTopType(member, shadowedAliases) === "any")) {
          return false;
        }
        const hasObject = type.types.some((member) =>
          resolvesToObject(member, shadowedAliases, visited),
        );
        return (
          hasObject &&
          type.types.every(
            (member) =>
              resolvesToObject(member, shadowedAliases, visited) ||
              isIntersectionNeutral(member, shadowedAliases),
          )
        );
      }
      if (
        type.type !== "TSTypeReference" ||
        type.typeName.type !== "Identifier" ||
        (type.typeArguments !== null &&
          type.typeArguments !== undefined &&
          type.typeArguments.params.length > 0) ||
        visited.has(type.typeName.name) ||
        shadowedAliases.has(type.typeName.name)
      ) {
        return false;
      }
      const binding = resolveLexicalTypeBinding(type.typeName.name, type);
      if (
        binding?.kind !== "alias" ||
        (binding.declaration.typeParameters !== null &&
          binding.declaration.typeParameters !== undefined)
      ) {
        return false;
      }
      const nextVisited = new Set(visited);
      nextVisited.add(type.typeName.name);
      return resolvesToObject(binding.declaration.typeAnnotation, shadowedAliases, nextVisited);
    };

    const checkParameters = (node: ParameterOwner) => {
      const shadowedAliases = lexicalTypeParameterNames(node, context.sourceCode.visitorKeys);
      for (const parameter of node.params) {
        const annotation = parameterAnnotation(parameter);
        if (annotation === null || annotation === undefined) continue;
        if (!resolvesToObject(annotation.typeAnnotation, shadowedAliases)) continue;
        context.report({
          node: annotation.typeAnnotation,
          messageId: "objectParameter",
          data: { parameter: parameterName(parameter, context.sourceCode) },
        });
      }
    };

    return {
      ArrowFunctionExpression: checkParameters,
      FunctionDeclaration: checkParameters,
      FunctionExpression: checkParameters,
      TSCallSignatureDeclaration: checkParameters,
      TSConstructSignatureDeclaration: checkParameters,
      TSConstructorType: checkParameters,
      TSDeclareFunction: checkParameters,
      TSEmptyBodyFunctionExpression: checkParameters,
      TSFunctionType: checkParameters,
      TSMethodSignature: checkParameters,
    };
  },
});
