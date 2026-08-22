import { defineRule } from "@oxlint/plugins";

import {
  classifyBroadDictionary,
  classifyBroadDictionaryValue,
  isLocalTypeAliasReference,
} from "../shared/broad-dictionary-types.ts";
import { lexicalTypeParameterNames } from "../shared/lexical-type-parameters.ts";

import type { ESTree } from "@oxlint/plugins";

const typeNodeKinds: ReadonlySet<string> = new Set([
  "JSDocNonNullableType",
  "JSDocNullableType",
  "JSDocUnknownType",
  "TSAnyKeyword",
  "TSArrayType",
  "TSBigIntKeyword",
  "TSBooleanKeyword",
  "TSConditionalType",
  "TSConstructorType",
  "TSFunctionType",
  "TSImportType",
  "TSIndexedAccessType",
  "TSInferType",
  "TSIntersectionType",
  "TSIntrinsicKeyword",
  "TSLiteralType",
  "TSMappedType",
  "TSNamedTupleMember",
  "TSNeverKeyword",
  "TSNullKeyword",
  "TSNumberKeyword",
  "TSObjectKeyword",
  "TSParenthesizedType",
  "TSStringKeyword",
  "TSSymbolKeyword",
  "TSTemplateLiteralType",
  "TSThisType",
  "TSTupleType",
  "TSTypeLiteral",
  "TSTypeOperator",
  "TSTypePredicate",
  "TSTypeQuery",
  "TSTypeReference",
  "TSUndefinedKeyword",
  "TSUnionType",
  "TSUnknownKeyword",
  "TSVoidKeyword",
]);

function isTypeNode(node: ESTree.Node): node is ESTree.TSType {
  return typeNodeKinds.has(node.type);
}

function isInsideTypeAliasDeclaration(node: ESTree.Node): boolean {
  let current: ESTree.Node | null = node.parent;
  while (current !== null && current.type !== "Program") {
    if (current.type === "TSTypeAliasDeclaration") return true;
    current = current.parent;
  }
  return false;
}

function isPlainAliasConsumerUse(node: ESTree.TSType): boolean {
  if (node.type !== "TSTypeReference" || node.typeArguments?.params.length) return false;
  return isLocalTypeAliasReference(node) && !isInsideTypeAliasDeclaration(node);
}

function shouldReportType(
  node: ESTree.TSType,
  classify: (type: ESTree.TSType) => boolean,
): boolean {
  if (isPlainAliasConsumerUse(node)) return false;
  if (!classify(node)) return false;
  let current: ESTree.Node | null = node.parent;
  while (current !== null && current.type !== "Program") {
    if (isTypeNode(current) && classify(current)) return false;
    current = current.parent;
  }
  return true;
}

/** Disallow object-dictionary contracts whose direct value type is too broad to describe a domain. */
export const noBroadDictionaryValuesRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow object-dictionary contracts whose value type resolves to object or a derived semantically empty contract not owned by the native empty-object rule.",
    },
    messages: {
      broadDictionary:
        "This dictionary's {{value}} value type is too broad. Use `unknown` for genuinely uncertain values or an owner/schema-derived value type.",
    },
  },
  createOnce(context) {
    const report = (node: ESTree.Node, value: string) => {
      context.report({ node, messageId: "broadDictionary", data: { value } });
    };
    const reportIfBroad = (node: ESTree.TSType) => {
      const classify = (type: ESTree.TSType) =>
        classifyBroadDictionary(
          type,
          lexicalTypeParameterNames(type, context.sourceCode.visitorKeys),
        ) !== null;
      if (!shouldReportType(node, classify)) return;
      const broad = classifyBroadDictionary(
        node,
        lexicalTypeParameterNames(node, context.sourceCode.visitorKeys),
      );
      if (broad === null) return;
      report(node, broad.broadValue);
    };

    return {
      TSTypeReference: reportIfBroad,
      TSTypeLiteral: reportIfBroad,
      TSMappedType: reportIfBroad,
      TSIndexSignature(node) {
        if (node.typeAnnotation === null || node.parent.type === "TSTypeLiteral") return;
        const broad = classifyBroadDictionaryValue(
          node.typeAnnotation.typeAnnotation,
          lexicalTypeParameterNames(node, context.sourceCode.visitorKeys),
        );
        if (broad !== null) report(node, broad.broadValue);
      },
    };
  },
});
