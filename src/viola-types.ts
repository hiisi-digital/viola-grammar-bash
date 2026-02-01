/**
 * Type definitions from @hiisi/viola package.
 * 
 * These types are vendored from the hiisi-digital/viola repository
 * to avoid import resolution issues when importing from GitHub raw URLs.
 * 
 * Source: https://github.com/hiisi-digital/viola
 * - src/grammars/types.ts
 * - src/data/types.ts
 * 
 * @module
 */

// =============================================================================
// Tree-sitter Types (from src/grammars/types.ts)
// =============================================================================

/**
 * A tree-sitter syntax node (simplified interface).
 */
export interface SyntaxNode {
  readonly type: string;
  readonly text: string;
  readonly startPosition: { row: number; column: number };
  readonly endPosition: { row: number; column: number };
  readonly startIndex: number;
  readonly endIndex: number;
  readonly parent: SyntaxNode | null;
  readonly children: readonly SyntaxNode[];
  readonly namedChildren: readonly SyntaxNode[];
  childForFieldName(name: string): SyntaxNode | null;
  readonly hasError: boolean;
  readonly isMissing: boolean;
}

// =============================================================================
// Grammar Metadata (from src/grammars/types.ts)
// =============================================================================

export interface GrammarMeta {
  readonly id: string;
  readonly name: string;
  readonly extensions: readonly string[];
  readonly globs?: readonly string[];
  readonly description?: string;
}

export interface GrammarSource {
  readonly source: "npm" | "url" | "bundled";
  readonly package?: string;
  readonly wasm?: string;
  readonly url?: string;
}

// =============================================================================
// Extraction Queries (from src/grammars/types.ts)
// =============================================================================

export interface ExtractionQueries {
  readonly functions: string;
  readonly strings?: string;
  readonly imports?: string;
  readonly exports?: string;
  readonly types?: string;
  readonly docComments?: string;
}

// =============================================================================
// Function Parameter Type (from src/data/types.ts)
// =============================================================================

export interface FunctionParam {
  readonly name: string;
  readonly type?: string;
  readonly optional: boolean;
  readonly rest: boolean;
  readonly defaultValue?: string;
}

// =============================================================================
// Grammar Transforms (from src/grammars/types.ts)
// =============================================================================

export interface QueryCaptures {
  get(name: string): { node: SyntaxNode; text: string } | undefined;
  has(name: string): boolean;
  all(): ReadonlyMap<string, { node: SyntaxNode; text: string }>;
}

export interface GrammarTransforms {
  parseParams?: (
    paramsNode: SyntaxNode | undefined,
    source: string
  ) => FunctionParam[];
  
  normalizeBody?: (body: string, languageId: string) => string;
  
  isExported?: (node: SyntaxNode, captures: QueryCaptures) => boolean;
  
  parseImport?: (
    node: SyntaxNode,
    captures: QueryCaptures,
    source: string
  ) => unknown;
  
  parseDocComment?: (node: SyntaxNode, source: string) => string;
}

// =============================================================================
// Grammar Definition (from src/grammars/types.ts)
// =============================================================================

export interface GrammarDefinition {
  readonly meta: GrammarMeta;
  readonly grammar: GrammarSource;
  readonly queries: ExtractionQueries;
  readonly transforms?: GrammarTransforms;
}
