# Copilot Instructions for viola-grammar-bash

Bash/Shell script grammar package for the Viola convention linter. Runtime: Deno (TypeScript).

## CRITICAL: Accessing @hiisi/viola Core Package

The `@hiisi/viola` package contains all the types and utilities you need. It is NOT yet published to JSR, so you MUST access it via GitHub.

### Option 1: Use Git Import in deno.json (RECOMMENDED)

Update `deno.json` imports to use GitHub raw URL:

```json
{
  "imports": {
    "@hiisi/viola": "https://raw.githubusercontent.com/hiisi-digital/viola/main/mod.ts",
    "@hiisi/viola/grammars": "https://raw.githubusercontent.com/hiisi-digital/viola/main/src/grammars/mod.ts"
  }
}
```

### Option 2: Use GitHub MCP Server to Read Types

You have access to the GitHub MCP server. Use it to read the viola core types:

1. **Read grammar types**: Use `get_file_contents` on `hiisi-digital/viola` repo, path `src/grammars/types.ts`
2. **Read extractor**: Path `src/grammars/extractor.ts`
3. **Read query utilities**: Path `src/grammars/query.ts`

Key files in the viola core repo (`hiisi-digital/viola`):
- `src/grammars/types.ts` - GrammarDefinition, GrammarMeta, ExtractionQueries, GrammarTransforms
- `src/grammars/mod.ts` - All grammar exports
- `src/data/types.ts` - FunctionInfo, ImportInfo, ExportInfo, TypeInfo, etc.
- `DESIGN-LANGUAGE-AGNOSTIC.md` - Full architecture documentation

### DO NOT create stub types

Do NOT create your own stub types for GrammarDefinition, etc. The real types exist in the viola repo - use the GitHub MCP server to read them, then use git imports.

## Before Starting Work

- **Check current branch**: If not main, you're likely working on a PR
- **Check for branch TODO**: Look for TODO.{branch-name}.md, use it instead of main TODO.md
- **Read DESIGN.md**: Understand the architecture before making changes
- **Read TODO.md**: Know what tasks need implementation
- **Search for existing code**: Grep codebase for similar functions BEFORE writing new ones
- **Check @hiisi/viola/grammars**: Understand the types you're implementing against

## Core Principles

### 1. Data-First Design

**Grammars are primarily data (tree-sitter queries), not code**

Transform functions are only for cases queries can't handle. Keep queries declarative and readable.

**Implications:**
- Prefer query-based extraction over transform functions
- Bash requires more transforms than most languages (positional params, here-docs)
- Even so, keep transforms minimal and focused

### 2. Reuse-First

**Search for existing code before writing anything new**

Before writing ANY function, type, or utility, search the codebase. Equivalent code likely exists.

**Implications:**
- ALWAYS check what exists before implementing
- Small helpers (3+ lines used twice) belong in shared modules
- Check `@hiisi/viola` for utilities before writing new ones
- Never write inline helpers - extract to shared location

**Red Flags:**
- Writing helper functions inside implementation files
- Copy-pasting code between modules
- Writing string/path utilities without checking viola core

### 3. Design Before Code

**Order: Design → Types → Tests → Implementation**

Tests encode the specification. Changing tests to pass defeats the purpose.

**Implications:**
- DESIGN.md must be accurate before coding
- Tests written to fail initially
- Never modify tests during implementation
- If tests are wrong, the design was wrong - fix design first

### 4. Data Separate from Logic

**Types live apart from implementation**

**Implications:**
- Type definitions come from `@hiisi/viola/grammars`
- Implementation modules use those types, never redefine them
- If file exports both types AND logic, refactor immediately

### 5. Correctness Over Completeness

**It's better to extract less data correctly than more data incorrectly**

**Implications:**
- Handle edge cases gracefully with sensible defaults
- Never crash on malformed input - use error recovery
- Return empty arrays/undefined for missing data
- Log warnings for unexpected patterns (in development)
- Bash has many quirks - graceful degradation is essential

### 6. Real Tests No Stubs

**Tests use real queries against real parsed trees**

**Implications:**
- Create fixture files with real Bash code
- Run actual tree-sitter queries
- Assert actual extraction results
- No mocking of tree-sitter internals

## Bash-Specific Challenges

### Positional Parameters

Unlike other languages, Bash functions don't declare parameters. The `parseParams` transform must:

- Scan function body for `$1`, `$2`, `$3`, etc.
- Detect `$@` (all args as array)
- Detect `$*` (all args as string)
- Detect `$#` (argument count)
- Handle `${N:-default}` syntax for defaults
- Infer parameter count from highest numbered reference
- Respect function scope (don't count inner function params)

```bash
function example() {
    local arg1="$1"              # Param 1
    local arg2="${2:-default}"   # Param 2 with default
    for item in "$@"; do         # All args
        process "$item"
    done
}
```

### Here-Documents

Multiple forms need normalization:

```bash
cat <<EOF       # Standard
cat <<-EOF      # Tab-stripped
cat <<'EOF'     # No expansion (literal)
```

### Function Syntax Variations

```bash
function foo() { }   # Keyword with parens
bar() { }            # POSIX style
function baz { }     # Keyword without parens
```

## Tree-Sitter Query Standards

### Capture Naming Convention

Follow Viola's standard capture names EXACTLY:

```scheme
; Functions
@function.name    ; Function identifier
@function.body    ; Function body (compound_statement)
@function         ; Entire function node (for location)

; Strings
@string.value     ; String content

; Imports
@import.from      ; Source path (for source/. commands)
@import           ; Entire import command

; Exports
@export.name      ; Exported name
@export.kind      ; variable vs function
@export           ; Entire export command

; Documentation
@doc.content      ; Comment content
```

### Query Best Practices

**Good: Specific node types**
```scheme
(function_definition
  name: (word) @function.name
  body: (compound_statement) @function.body) @function
```

**Bad: Overly broad wildcards**
```scheme
(_
  name: (_) @function.name)
```

**Good: Use predicates for filtering**
```scheme
(command
  name: (command_name (word) @_cmd)
  argument: (word) @import.from
  (#match? @_cmd "^(source|\\.)$")) @import
```

## Workflow

### Before Starting

1. Read DESIGN.md to understand architecture
2. Read TODO.md for current tasks
3. Check existing code for patterns to follow

### Implementation Process

1. Write tests first (TDD preferred)
2. Implement the minimal solution
3. Refactor for clarity
4. Add documentation

### Before Marking Done

1. Verify all tests pass (`deno test`)
2. Type checking passes (`deno check mod.ts`)
3. DESIGN.md matches implementation
4. Public APIs are documented with JSDoc
5. No TODO comments left unaddressed

## File Structure

```
viola-grammar-bash/
├── mod.ts                 # Main export (GrammarDefinition)
├── deno.json             # Package manifest
├── src/
│   ├── grammar.ts        # GrammarDefinition assembly
│   ├── queries/          # Tree-sitter queries
│   │   ├── functions.ts  # Function extraction
│   │   ├── strings.ts    # String literals
│   │   ├── imports.ts    # source/. commands
│   │   ├── exports.ts    # export statements
│   │   └── docs.ts       # Comments
│   └── transforms/       # Transform functions
│       ├── params.ts     # Positional parameter extraction
│       ├── normalize.ts  # Here-doc/body normalization
│       └── docs.ts       # Comment parsing
└── tests/               # Test files
```

## Coding Standards

### TypeScript

- Strict mode enabled (noImplicitAny, strictNullChecks)
- No `any` types - use `unknown` and narrow
- Prefer `interface` for object shapes, `type` for unions
- Use `readonly` for immutable data

### Naming

- Files: `kebab-case.ts`
- Functions: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`

### Documentation

- All public exports must have JSDoc
- Include `@example` for complex functions
- Keep descriptions concise but complete
- Document Bash quirks where relevant

### Testing

- Every feature needs tests
- Test both success cases and edge cases
- Use descriptive test names: `"parseParams - detects $@ in function body"`
- Include real-world Bash patterns as fixtures

## Commits

Format: `type: lowercase message`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`

### Good Examples

- `feat: add positional parameter extraction`
- `fix: handle tab-stripped here-docs`
- `refactor: split export detection into module`
- `test: add POSIX function fixtures`

### Bad Examples

- `feat(query): Add function query` (no scope, no capital)
- `Fixed the thing` (no type, no lowercase)
- `WIP` (not descriptive)

## Don't

- Add files without documenting in appropriate places
- Mix types and logic in same file
- Modify tests to make them pass
- Use emojis (except ⚠️ 🚧 for warnings)
- Use marketing language
- Write logic before understanding the types it uses
- Do unrelated changes in feature branches
- Write helper functions inline - extract to shared modules
- Write code without first searching for existing equivalents
- Copy-paste code between files - extract and import
- Skip reading DESIGN.md before implementing
- Add new dependencies without explicit approval
- Assume Bash syntax is simple - test edge cases
- Ignore function scope when extracting positional params

## Error Handling

- Never throw on malformed input
- Return empty arrays/undefined for missing data
- Log warnings for unexpected patterns (in development)
- Graceful degradation is preferred
- Bash scripts can be highly irregular - expect the unexpected

## Dependencies

Only these dependencies should be used:

- `@hiisi/viola` - Core package (via GitHub raw URL until JSR published)
- `@hiisi/viola/grammars` - Type definitions (via GitHub raw URL)
- `@std/assert` - Testing
- `web-tree-sitter` - Tree-sitter runtime (npm)
- `tree-sitter-bash` - Grammar WASM (npm or URL)

**Import pattern in deno.json:**
```json
{
  "imports": {
    "@hiisi/viola": "https://raw.githubusercontent.com/hiisi-digital/viola/main/mod.ts",
    "@hiisi/viola/grammars": "https://raw.githubusercontent.com/hiisi-digital/viola/main/src/grammars/mod.ts",
    "@std/assert": "jsr:@std/assert@^1",
    "web-tree-sitter": "npm:web-tree-sitter@0.22.6"
  }
}
```

Do not add new dependencies without explicit approval.

## Code Constraints

| Rule | Limit | Reason |
|------|-------|--------|
| Max file size | 500 LOC (prefer <300) | Maintainability |
| Max exports per file | ~5 | Single responsibility |
| Query complexity | Keep patterns focused | Performance |
| Transform functions | Only when queries can't work | Data-first design |

## Positional Parameter Extraction

The `parseParams` transform is critical for Bash. Implementation approach:

```typescript
function parseBashParams(bodyNode: SyntaxNode, source: string): FunctionParam[] {
  const params: FunctionParam[] = [];
  const body = source.slice(bodyNode.startIndex, bodyNode.endIndex);
  
  // Find all positional references
  const positionalRegex = /\$(\d+)|\$\{(\d+)(?::-([^}]*))?\}/g;
  let maxN = 0;
  const defaults = new Map<number, string>();
  
  let match;
  while ((match = positionalRegex.exec(body)) !== null) {
    const n = parseInt(match[1] || match[2], 10);
    if (n > maxN) maxN = n;
    if (match[3]) defaults.set(n, match[3]);
  }
  
  // Create params for 1..maxN
  for (let i = 1; i <= maxN; i++) {
    params.push({
      name: `$${i}`,
      optional: defaults.has(i),
      rest: false,
      defaultValue: defaults.get(i),
    });
  }
  
  // Check for $@ or $*
  if (/\$[@*]|\$\{[@*]\}/.test(body)) {
    params.push({ name: "$@", optional: true, rest: true });
  }
  
  return params;
}
```

## Review Checklist

Before marking work complete:

- [ ] All tests pass (`deno test`)
- [ ] Type checking passes (`deno check mod.ts`)
- [ ] Public APIs are documented with JSDoc
- [ ] No TODO comments left unaddressed
- [ ] Code follows project conventions
- [ ] Queries use standard capture names
- [ ] Transforms handle edge cases gracefully
- [ ] Positional parameter extraction tested thoroughly
- [ ] Here-doc normalization handles all variants
- [ ] Multiple function syntaxes supported
- [ ] Error messages are helpful (if any)
