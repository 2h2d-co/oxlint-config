import type { ESTree } from "@oxlint/plugins";

import { resolveLexicalTypeBinding } from "./lexical-type-bindings.ts";

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

type TypeAliasEnvironment = ReadonlyMap<string, ESTree.TSType>;

type ResolvedType = {
  readonly substitutions: TypeAliasEnvironment;
  readonly type: ESTree.TSType;
};

type ValueClassification =
  | {
      readonly kind: "any";
    }
  | {
      readonly kind: "broad";
      readonly value: UnsafeDictionary["unsafeValue"];
    }
  | {
      readonly kind: "concrete";
    }
  | {
      readonly kind: "unknown";
    };

export type UnsafeDictionary = {
  readonly kind: "unsafe-dictionary";
  readonly unsafeValue: "empty-object" | "object" | "union";
};

function typeReferenceName(type: ESTree.TSTypeReference): string | null {
  return type.typeName.type === "Identifier" ? type.typeName.name : null;
}

function isBuiltIn(name: string, node: ESTree.Node, shadowedNames: ReadonlySet<string>): boolean {
  return (
    BUILT_INS.has(name) &&
    !shadowedNames.has(name) &&
    resolveLexicalTypeBinding(name, node) === null
  );
}

function isUnappliedReferenceTo(type: ESTree.TSType, name: string): boolean {
  const unwrapped = unwrapTransparentType(type);
  return (
    unwrapped.type === "TSTypeReference" &&
    typeReferenceName(unwrapped) === name &&
    (unwrapped.typeArguments === null ||
      unwrapped.typeArguments === undefined ||
      unwrapped.typeArguments.params.length === 0)
  );
}

function unwrapTransparentType(type: ESTree.TSType): ESTree.TSType {
  let current = type;
  while (
    current.type === "TSParenthesizedType" ||
    (current.type === "TSTypeOperator" && current.operator === "readonly")
  ) {
    current = current.typeAnnotation;
  }
  return current;
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

function isEffectivelyEmptyTypeLiteral(type: ESTree.TSTypeLiteral): boolean {
  return type.members.length === 0 || type.members.every(isEffectivelyEmptyMember);
}

function isEffectivelyEmptyInterface(
  declarations: readonly ESTree.TSInterfaceDeclaration[],
): boolean {
  if (declarations.length !== 1) return false;
  const [type] = declarations;
  return (
    type !== undefined &&
    type.extends.length === 0 &&
    (type.body.body.length === 0 || type.body.body.every(isEffectivelyEmptyMember))
  );
}

function resolvedSubstitutionArgument(
  type: ESTree.TSType,
  base: TypeAliasEnvironment,
  resolving: ReadonlySet<string> = new Set(),
): ESTree.TSType {
  const unwrapped = unwrapTransparentType(type);
  if (unwrapped.type !== "TSTypeReference") return type;
  const name = typeReferenceName(unwrapped);
  if (name === null || resolving.has(name)) return type;
  const substitution = base.get(name);
  if (substitution === undefined) return type;
  const nextResolving = new Set(resolving);
  nextResolving.add(name);
  return resolvedSubstitutionArgument(substitution, base, nextResolving);
}

function aliasSubstitution(
  alias: ESTree.TSTypeAliasDeclaration,
  type: ESTree.TSTypeReference,
  base: TypeAliasEnvironment,
): TypeAliasEnvironment | null {
  const parameters = alias.typeParameters?.params ?? [];
  const arguments_ = type.typeArguments?.params ?? [];
  const next = new Map(base);
  for (const [index, parameter] of parameters.entries()) {
    const argument = arguments_[index] ?? parameter.default;
    if (argument === null || argument === undefined) return null;
    next.set(parameter.name.name, resolvedSubstitutionArgument(argument, next));
  }
  return next;
}

function classifyUnion(members: readonly ValueClassification[]): ValueClassification {
  if (members.some((member) => member.kind === "any")) return { kind: "any" };
  if (members.some((member) => member.kind === "unknown")) return { kind: "unknown" };
  if (members.some((member) => member.kind === "broad")) {
    return { kind: "broad", value: "union" };
  }
  return { kind: "concrete" };
}

function classifyIntersection(members: readonly ValueClassification[]): ValueClassification {
  if (members.some((member) => member.kind === "any")) return { kind: "any" };
  if (members.some((member) => member.kind === "concrete")) return { kind: "concrete" };
  const broad = members.find((member) => member.kind === "broad");
  if (broad !== undefined) return broad;
  return { kind: "unknown" };
}

function classifyDirectValue(
  type: ESTree.TSType,
  substitutions: TypeAliasEnvironment,
  resolvingAliases: ReadonlySet<ESTree.TSTypeAliasDeclaration>,
  shadowedNames: ReadonlySet<string>,
): ValueClassification {
  const unwrapped = unwrapTransparentType(type);
  if (unwrapped.type === "TSUnknownKeyword") return { kind: "unknown" };
  if (unwrapped.type === "TSAnyKeyword") return { kind: "any" };
  if (unwrapped.type === "TSObjectKeyword") return { kind: "broad", value: "object" };
  if (unwrapped.type === "TSTypeLiteral") {
    return isEffectivelyEmptyTypeLiteral(unwrapped)
      ? { kind: "broad", value: "empty-object" }
      : { kind: "concrete" };
  }
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
    return isEffectivelyEmptyInterface(binding.declarations)
      ? { kind: "broad", value: "empty-object" }
      : { kind: "concrete" };
  }
  if (binding?.kind !== "alias" || resolvingAliases.has(binding.declaration)) {
    return { kind: "concrete" };
  }
  const nextSubstitutions = aliasSubstitution(binding.declaration, unwrapped, substitutions);
  if (nextSubstitutions === null) return { kind: "concrete" };
  const nextResolving = new Set(resolvingAliases);
  nextResolving.add(binding.declaration);
  return classifyDirectValue(
    binding.declaration.typeAnnotation,
    nextSubstitutions,
    nextResolving,
    shadowedNames,
  );
}

function dictionaryValueTypes(
  type: ESTree.TSType,
  substitutions: TypeAliasEnvironment,
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

  const binding = resolveLexicalTypeBinding(name, unwrapped);
  if (binding?.kind !== "alias" || resolvingAliases.has(binding.declaration)) return [];
  const nextSubstitutions = aliasSubstitution(binding.declaration, unwrapped, substitutions);
  if (nextSubstitutions === null) return [];
  const nextResolving = new Set(resolvingAliases);
  nextResolving.add(binding.declaration);
  return dictionaryValueTypes(
    binding.declaration.typeAnnotation,
    nextSubstitutions,
    nextResolving,
    shadowedNames,
  );
}

export function isLocalTypeAliasReference(type: ESTree.TSTypeReference): boolean {
  const name = typeReferenceName(type);
  return name !== null && resolveLexicalTypeBinding(name, type)?.kind === "alias";
}

export function classifyUnsafeDictionaryValue(
  valueType: ESTree.TSType,
  shadowedNames: ReadonlySet<string>,
): UnsafeDictionary | null {
  const classification = classifyDirectValue(valueType, new Map(), new Set(), shadowedNames);
  return classification.kind === "broad"
    ? { kind: "unsafe-dictionary", unsafeValue: classification.value }
    : null;
}

export function classifyUnsafeDictionary(
  type: ESTree.TSType,
  shadowedNames: ReadonlySet<string>,
): UnsafeDictionary | null {
  for (const valueType of dictionaryValueTypes(type, new Map(), new Set(), shadowedNames)) {
    const classification = classifyDirectValue(
      valueType.type,
      valueType.substitutions,
      new Set(),
      shadowedNames,
    );
    if (classification.kind === "broad") {
      return { kind: "unsafe-dictionary", unsafeValue: classification.value };
    }
  }
  return null;
}
