import type { ESTree } from "@oxlint/plugins";

import { resolveLexicalTypeBinding } from "./lexical-type-bindings.ts";
import {
  instantiateLocalTypeAlias,
  isUnappliedReferenceTo,
  typeReferenceName,
  type TypeSubstitutions,
  unwrapTransparentType,
} from "./local-type-aliases.ts";

const BUILT_INS = new Set([
  "NonNullable",
  "Omit",
  "Partial",
  "Pick",
  "Readonly",
  "Record",
  "Required",
]);
const TRANSPARENT_WRAPPERS = new Set(["NonNullable", "Partial", "Readonly", "Required"]);

type ResolvedType = {
  readonly substitutions: TypeSubstitutions;
  readonly type: ESTree.TSType;
};

type ValueClassification =
  | {
      readonly kind: "any";
    }
  | {
      readonly kind: "broad";
      readonly value: BroadDictionary["broadValue"];
    }
  | {
      readonly kind: "concrete";
    }
  | {
      readonly kind: "native-empty";
    }
  | {
      readonly kind: "unknown";
    };

export type BroadDictionary = {
  readonly broadValue: "empty-object" | "object" | "union";
  readonly kind: "broad-dictionary";
};

function isBuiltIn(name: string, node: ESTree.Node, shadowedNames: ReadonlySet<string>): boolean {
  return (
    BUILT_INS.has(name) &&
    !shadowedNames.has(name) &&
    resolveLexicalTypeBinding(name, node) === null
  );
}

function isNeverType(type: ESTree.TSType): boolean {
  return unwrapTransparentType(type).type === "TSNeverKeyword";
}

function isEffectivelyEmptyMember(member: ESTree.TSSignature): boolean {
  return (
    member.type === "TSPropertySignature" &&
    member.optional === true &&
    member.typeAnnotation !== null &&
    member.typeAnnotation !== undefined &&
    isNeverType(member.typeAnnotation.typeAnnotation)
  );
}

function classifyTypeLiteral(type: ESTree.TSTypeLiteral): ValueClassification {
  if (type.members.length === 0) return { kind: "native-empty" };
  return type.members.every(isEffectivelyEmptyMember)
    ? { kind: "broad", value: "empty-object" }
    : { kind: "concrete" };
}

function classifyInterface(
  declarations: readonly ESTree.TSInterfaceDeclaration[],
): ValueClassification {
  if (declarations.length !== 1) return { kind: "concrete" };
  const [type] = declarations;
  if (type === undefined || type.extends.length > 0) return { kind: "concrete" };
  if (type.body.body.length === 0) return { kind: "native-empty" };
  return type.body.body.every(isEffectivelyEmptyMember)
    ? { kind: "broad", value: "empty-object" }
    : { kind: "concrete" };
}

function classifyUnion(members: readonly ValueClassification[]): ValueClassification {
  if (members.some((member) => member.kind === "any")) return { kind: "any" };
  if (members.some((member) => member.kind === "unknown")) return { kind: "unknown" };
  if (members.some((member) => member.kind === "broad")) {
    return { kind: "broad", value: "union" };
  }
  if (members.some((member) => member.kind === "native-empty")) {
    return { kind: "native-empty" };
  }
  return { kind: "concrete" };
}

function classifyIntersection(members: readonly ValueClassification[]): ValueClassification {
  if (members.some((member) => member.kind === "any")) return { kind: "any" };
  if (members.some((member) => member.kind === "concrete")) return { kind: "concrete" };
  const broad = members.find((member) => member.kind === "broad");
  if (broad !== undefined) return broad;
  if (members.some((member) => member.kind === "native-empty")) {
    return { kind: "broad", value: "empty-object" };
  }
  return { kind: "unknown" };
}

function classifyDirectValue(
  type: ESTree.TSType,
  substitutions: TypeSubstitutions,
  resolvingAliases: ReadonlySet<ESTree.TSTypeAliasDeclaration>,
  shadowedNames: ReadonlySet<string>,
): ValueClassification {
  const unwrapped = unwrapTransparentType(type);
  if (unwrapped.type === "TSUnknownKeyword") return { kind: "unknown" };
  if (unwrapped.type === "TSAnyKeyword") return { kind: "any" };
  if (unwrapped.type === "TSObjectKeyword") return { kind: "broad", value: "object" };
  if (unwrapped.type === "TSTypeLiteral") return classifyTypeLiteral(unwrapped);
  if (unwrapped.type === "TSUnionType") {
    return classifyUnion(
      unwrapped.types.map((member) =>
        classifyDirectValue(member, substitutions, resolvingAliases, shadowedNames),
      ),
    );
  }
  if (unwrapped.type === "TSIntersectionType") {
    return classifyIntersection(
      unwrapped.types.map((member) =>
        classifyDirectValue(member, substitutions, resolvingAliases, shadowedNames),
      ),
    );
  }
  if (unwrapped.type !== "TSTypeReference") return { kind: "concrete" };
  const name = typeReferenceName(unwrapped);
  if (name === null) return { kind: "concrete" };

  const substitution = substitutions.get(name);
  if (substitution !== undefined) {
    return isUnappliedReferenceTo(substitution, name)
      ? { kind: "concrete" }
      : classifyDirectValue(substitution, substitutions, resolvingAliases, shadowedNames);
  }
  if (shadowedNames.has(name)) return { kind: "concrete" };
  if (TRANSPARENT_WRAPPERS.has(name) && isBuiltIn(name, unwrapped, shadowedNames)) {
    const wrapped = unwrapped.typeArguments?.params[0];
    const classification: ValueClassification =
      wrapped === undefined
        ? { kind: "concrete" }
        : classifyDirectValue(wrapped, substitutions, resolvingAliases, shadowedNames);
    return name === "NonNullable" && classification.kind === "unknown"
      ? { kind: "broad", value: "empty-object" }
      : classification;
  }

  const binding = resolveLexicalTypeBinding(name, unwrapped);
  if (binding?.kind === "interface") {
    return classifyInterface(binding.declarations);
  }
  const alias = instantiateLocalTypeAlias(
    unwrapped,
    substitutions,
    resolvingAliases,
    shadowedNames,
  );
  if (alias === null) return { kind: "concrete" };
  const nextResolving = new Set(resolvingAliases);
  nextResolving.add(alias.declaration);
  return classifyDirectValue(
    alias.declaration.typeAnnotation,
    alias.substitutions,
    nextResolving,
    shadowedNames,
  );
}

function dictionaryValueTypes(
  type: ESTree.TSType,
  substitutions: TypeSubstitutions,
  resolvingAliases: ReadonlySet<ESTree.TSTypeAliasDeclaration>,
  shadowedNames: ReadonlySet<string>,
): readonly ResolvedType[] {
  const unwrapped = unwrapTransparentType(type);

  if (unwrapped.type === "TSTypeLiteral") {
    return unwrapped.members.flatMap((member): readonly ResolvedType[] =>
      member.type === "TSIndexSignature" && member.typeAnnotation !== null
        ? [{ substitutions, type: member.typeAnnotation.typeAnnotation }]
        : [],
    );
  }
  if (unwrapped.type === "TSMappedType") {
    return unwrapped.typeAnnotation === null
      ? []
      : [{ substitutions, type: unwrapped.typeAnnotation }];
  }
  if (unwrapped.type !== "TSTypeReference") return [];
  const name = typeReferenceName(unwrapped);
  if (name === null) return [];

  const substitution = substitutions.get(name);
  if (substitution !== undefined) {
    return isUnappliedReferenceTo(substitution, name)
      ? []
      : dictionaryValueTypes(substitution, substitutions, resolvingAliases, shadowedNames);
  }
  if (shadowedNames.has(name)) return [];
  if (TRANSPARENT_WRAPPERS.has(name) && isBuiltIn(name, unwrapped, shadowedNames)) {
    const wrapped = unwrapped.typeArguments?.params[0];
    return wrapped === undefined
      ? []
      : dictionaryValueTypes(wrapped, substitutions, resolvingAliases, shadowedNames);
  }
  if (name === "Record" && isBuiltIn(name, unwrapped, shadowedNames)) {
    const value = unwrapped.typeArguments?.params[1];
    return value === undefined ? [] : [{ substitutions, type: value }];
  }
  if ((name === "Pick" || name === "Omit") && isBuiltIn(name, unwrapped, shadowedNames)) {
    const source = unwrapped.typeArguments?.params[0];
    return source === undefined
      ? []
      : dictionaryValueTypes(source, substitutions, resolvingAliases, shadowedNames);
  }

  const alias = instantiateLocalTypeAlias(
    unwrapped,
    substitutions,
    resolvingAliases,
    shadowedNames,
  );
  if (alias === null) return [];
  const nextResolving = new Set(resolvingAliases);
  nextResolving.add(alias.declaration);
  return dictionaryValueTypes(
    alias.declaration.typeAnnotation,
    alias.substitutions,
    nextResolving,
    shadowedNames,
  );
}

export function isLocalTypeAliasReference(type: ESTree.TSTypeReference): boolean {
  const name = typeReferenceName(type);
  return name !== null && resolveLexicalTypeBinding(name, type)?.kind === "alias";
}

export function classifyBroadDictionaryValue(
  valueType: ESTree.TSType,
  shadowedNames: ReadonlySet<string>,
): BroadDictionary | null {
  const classification = classifyDirectValue(valueType, new Map(), new Set(), shadowedNames);
  return classification.kind === "broad"
    ? { broadValue: classification.value, kind: "broad-dictionary" }
    : null;
}

export function classifyBroadDictionary(
  type: ESTree.TSType,
  shadowedNames: ReadonlySet<string>,
): BroadDictionary | null {
  for (const valueType of dictionaryValueTypes(type, new Map(), new Set(), shadowedNames)) {
    const classification = classifyDirectValue(
      valueType.type,
      valueType.substitutions,
      new Set(),
      shadowedNames,
    );
    if (classification.kind === "broad") {
      return { broadValue: classification.value, kind: "broad-dictionary" };
    }
  }
  return null;
}
