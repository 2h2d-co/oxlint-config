import type { ESTree } from "@oxlint/plugins";

export type LexicalTypeBinding =
  | {
      readonly declaration: ESTree.TSTypeAliasDeclaration;
      readonly kind: "alias";
    }
  | {
      readonly declarations: readonly ESTree.TSInterfaceDeclaration[];
      readonly kind: "interface";
    }
  | {
      readonly kind: "other";
    };

type TypeScopeContainer =
  | ESTree.BlockStatement
  | ESTree.Program
  | ESTree.StaticBlock
  | ESTree.SwitchStatement
  | ESTree.TSModuleBlock;

function declaredStatement(statement: ESTree.Statement): ESTree.Node | null {
  return statement.type === "ExportNamedDeclaration" ||
    statement.type === "ExportDefaultDeclaration"
    ? (statement.declaration ?? null)
    : statement;
}

function isTypeScopeContainer(node: ESTree.Node): node is TypeScopeContainer {
  return (
    node.type === "BlockStatement" ||
    node.type === "Program" ||
    node.type === "StaticBlock" ||
    node.type === "SwitchStatement" ||
    node.type === "TSModuleBlock"
  );
}

function containerStatements(container: TypeScopeContainer): readonly ESTree.Statement[] {
  return container.type === "SwitchStatement"
    ? container.cases.flatMap((switchCase) => switchCase.consequent)
    : container.body;
}

function declarationName(declaration: ESTree.Node): string | null {
  if (
    (declaration.type === "ClassDeclaration" ||
      declaration.type === "TSEnumDeclaration" ||
      declaration.type === "TSImportEqualsDeclaration" ||
      declaration.type === "TSInterfaceDeclaration" ||
      declaration.type === "TSTypeAliasDeclaration") &&
    declaration.id !== null
  ) {
    return declaration.id.name;
  }
  if (declaration.type === "TSModuleDeclaration" && declaration.id.type === "Identifier") {
    return declaration.id.name;
  }
  return null;
}

function bindingInContainer(
  container: TypeScopeContainer,
  name: string,
): LexicalTypeBinding | null {
  const aliases: ESTree.TSTypeAliasDeclaration[] = [];
  const interfaces: ESTree.TSInterfaceDeclaration[] = [];
  let hasOtherBinding = false;

  for (const statement of containerStatements(container)) {
    const declaration = declaredStatement(statement);
    if (declaration?.type === "ImportDeclaration") {
      if (declaration.specifiers.some((specifier) => specifier.local.name === name)) {
        hasOtherBinding = true;
      }
      continue;
    }
    if (declaration?.type === "TSTypeAliasDeclaration" && declaration.id.name === name) {
      aliases.push(declaration);
      continue;
    }
    if (declaration?.type === "TSInterfaceDeclaration" && declaration.id.name === name) {
      interfaces.push(declaration);
      continue;
    }
    if (declaration !== null && declarationName(declaration) === name) {
      hasOtherBinding = true;
    }
  }

  if (hasOtherBinding || aliases.length > 1 || (aliases.length > 0 && interfaces.length > 0)) {
    return { kind: "other" };
  }
  const [alias] = aliases;
  if (alias !== undefined) return { declaration: alias, kind: "alias" };
  if (interfaces.length > 0) return { declarations: interfaces, kind: "interface" };
  return null;
}

/** Resolve a type-space declaration from the nearest enclosing lexical statement scope. */
export function resolveLexicalTypeBinding(
  name: string,
  node: ESTree.Node,
): LexicalTypeBinding | null {
  let current: ESTree.Node | null = node;
  while (current !== null) {
    if (isTypeScopeContainer(current)) {
      const binding = bindingInContainer(current, name);
      if (binding !== null) return binding;
    }
    current = current.parent;
  }
  return null;
}
