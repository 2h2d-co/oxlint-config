import { defineRule } from "@oxlint/plugins";

import type { ESTree, SourceCode } from "@oxlint/plugins";

import { lexicalTypeParameterNames } from "../shared/lexical-type-parameters.ts";
import {
  instantiateLocalTypeAlias,
  isUnappliedReferenceTo,
  typeReferenceName,
  type TypeSubstitutions,
} from "../shared/local-type-aliases.ts";

type Parameter = ESTree.ParamPattern;
type ParameterOwner =
  | ESTree.ArrowFunctionExpression
  | ESTree.Function
  | ESTree.TSCallSignatureDeclaration
  | ESTree.TSConstructSignatureDeclaration
  | ESTree.TSConstructorType
  | ESTree.TSFunctionType
  | ESTree.TSMethodSignature;

type ResolutionState = {
  readonly resolvingAliases: ReadonlySet<ESTree.TSTypeAliasDeclaration>;
  readonly shadowedNames: ReadonlySet<string>;
  readonly substitutions: TypeSubstitutions;
};

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
export const noBroadObjectParametersRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow broad object function parameters; use a specific input contract or a generic object constraint.",
    },
    messages: {
      broadObjectParameter:
        "Parameter `{{parameter}}` uses the broad `object` contract. Use a specific input type or a meaningful generic constrained by `object`; suppress this rule when any non-primitive is the exact API.",
    },
  },
  createOnce(context) {
    const resolvesToTopType = (
      type: ESTree.TSType,
      state: ResolutionState,
    ): "any" | "unknown" | null => {
      if (type.type === "TSAnyKeyword") return "any";
      if (type.type === "TSUnknownKeyword") return "unknown";
      if (type.type === "TSParenthesizedType") {
        return resolvesToTopType(type.typeAnnotation, state);
      }
      if (type.type !== "TSTypeReference") return null;
      const name = typeReferenceName(type);
      if (name === null) return null;
      const substitution = state.substitutions.get(name);
      if (substitution !== undefined) {
        return isUnappliedReferenceTo(substitution, name)
          ? null
          : resolvesToTopType(substitution, state);
      }
      const alias = instantiateLocalTypeAlias(
        type,
        state.substitutions,
        state.resolvingAliases,
        state.shadowedNames,
      );
      if (alias === null) return null;
      const nextResolving = new Set(state.resolvingAliases);
      nextResolving.add(alias.declaration);
      return resolvesToTopType(alias.declaration.typeAnnotation, {
        resolvingAliases: nextResolving,
        shadowedNames: state.shadowedNames,
        substitutions: alias.substitutions,
      });
    };

    const isIntersectionNeutral = (type: ESTree.TSType, state: ResolutionState): boolean => {
      if (resolvesToTopType(type, state) === "unknown") return true;
      if (type.type === "TSParenthesizedType") {
        return isIntersectionNeutral(type.typeAnnotation, state);
      }
      return type.type === "TSTypeLiteral" && type.members.length === 0;
    };

    const resolvesToObject = (type: ESTree.TSType, state: ResolutionState): boolean => {
      if (type.type === "TSObjectKeyword") return true;
      if (type.type === "TSParenthesizedType") {
        return resolvesToObject(type.typeAnnotation, state);
      }
      if (type.type === "TSUnionType") {
        if (type.types.some((member) => resolvesToTopType(member, state) !== null)) {
          return false;
        }
        return type.types.some((member) => resolvesToObject(member, state));
      }
      if (type.type === "TSIntersectionType") {
        if (type.types.some((member) => resolvesToTopType(member, state) === "any")) {
          return false;
        }
        const hasObject = type.types.some((member) => resolvesToObject(member, state));
        return (
          hasObject &&
          type.types.every(
            (member) => resolvesToObject(member, state) || isIntersectionNeutral(member, state),
          )
        );
      }
      if (type.type !== "TSTypeReference") return false;
      const name = typeReferenceName(type);
      if (name === null) return false;
      const substitution = state.substitutions.get(name);
      if (substitution !== undefined) {
        return !isUnappliedReferenceTo(substitution, name) && resolvesToObject(substitution, state);
      }
      const alias = instantiateLocalTypeAlias(
        type,
        state.substitutions,
        state.resolvingAliases,
        state.shadowedNames,
      );
      if (alias === null) return false;
      const nextResolving = new Set(state.resolvingAliases);
      nextResolving.add(alias.declaration);
      return resolvesToObject(alias.declaration.typeAnnotation, {
        resolvingAliases: nextResolving,
        shadowedNames: state.shadowedNames,
        substitutions: alias.substitutions,
      });
    };

    const checkParameters = (node: ParameterOwner) => {
      const shadowedAliases = lexicalTypeParameterNames(node, context.sourceCode.visitorKeys);
      for (const parameter of node.params) {
        const annotation = parameterAnnotation(parameter);
        if (annotation === null || annotation === undefined) continue;
        if (
          !resolvesToObject(annotation.typeAnnotation, {
            resolvingAliases: new Set(),
            shadowedNames: shadowedAliases,
            substitutions: new Map(),
          })
        ) {
          continue;
        }
        context.report({
          node: annotation.typeAnnotation,
          messageId: "broadObjectParameter",
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
