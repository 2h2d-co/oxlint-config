import type { ESTree } from "@oxlint/plugins";

import { resolveLexicalTypeBinding } from "./lexical-type-bindings.ts";

export type TypeSubstitutions = ReadonlyMap<string, ESTree.TSType>;

export type LocalTypeAliasInstantiation = {
  readonly declaration: ESTree.TSTypeAliasDeclaration;
  readonly substitutions: TypeSubstitutions;
};

export function typeReferenceName(type: ESTree.TSTypeReference): string | null {
  return type.typeName.type === "Identifier" ? type.typeName.name : null;
}

export function unwrapTransparentType(type: ESTree.TSType): ESTree.TSType {
  let current = type;
  while (
    current.type === "TSParenthesizedType" ||
    (current.type === "TSTypeOperator" && current.operator === "readonly")
  ) {
    current = current.typeAnnotation;
  }
  return current;
}

export function isUnappliedReferenceTo(type: ESTree.TSType, name: string): boolean {
  const unwrapped = unwrapTransparentType(type);
  return (
    unwrapped.type === "TSTypeReference" &&
    typeReferenceName(unwrapped) === name &&
    (unwrapped.typeArguments === null ||
      unwrapped.typeArguments === undefined ||
      unwrapped.typeArguments.params.length === 0)
  );
}

function resolvedSubstitutionArgument(
  type: ESTree.TSType,
  base: TypeSubstitutions,
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

function aliasSubstitutions(
  alias: ESTree.TSTypeAliasDeclaration,
  type: ESTree.TSTypeReference,
  base: TypeSubstitutions,
): TypeSubstitutions | null {
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

/** Resolve and instantiate a local type alias reference without crossing lexical or generic scope. */
export function instantiateLocalTypeAlias(
  type: ESTree.TSTypeReference,
  substitutions: TypeSubstitutions,
  resolvingAliases: ReadonlySet<ESTree.TSTypeAliasDeclaration>,
  shadowedNames: ReadonlySet<string>,
): LocalTypeAliasInstantiation | null {
  const name = typeReferenceName(type);
  if (name === null || shadowedNames.has(name)) return null;
  const binding = resolveLexicalTypeBinding(name, type);
  if (binding?.kind !== "alias" || resolvingAliases.has(binding.declaration)) return null;
  const nextSubstitutions = aliasSubstitutions(binding.declaration, type, substitutions);
  return nextSubstitutions === null
    ? null
    : {
        declaration: binding.declaration,
        substitutions: nextSubstitutions,
      };
}
