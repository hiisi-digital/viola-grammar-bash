# TODO - viola-grammar-bash

Bash/Shell grammar package for Viola convention linter.

## ✅ Phase 1: Foundation (COMPLETED)

### Setup
- [x] Initialize deno.json with package metadata
- [x] Set up imports for @hiisi/viola/grammars
- [x] Configure tree-sitter-bash npm dependency
- [x] Create basic module structure

### Grammar Definition
- [x] Create `src/grammar.ts` with GrammarDefinition
- [x] Configure meta (id, name, extensions, globs)
- [x] Configure grammar source (npm package reference)
- [x] Export from mod.ts

## ✅ Phase 2: Extraction Queries (COMPLETED)

### Function Queries (`src/queries/functions.ts`)
- [x] Function definitions with `function` keyword
- [x] POSIX-style function definitions (name() {})
- [x] Function keyword without parentheses
- [x] Capture: name, body

### String Queries (`src/queries/strings.ts`)
- [x] Single-quoted strings (raw, no expansion)
- [x] Double-quoted strings (with expansion)
- [x] ANSI-C strings ($'...')
- [x] Here-documents
- [x] Here-strings (<<<)

### Import Queries (`src/queries/imports.ts`)
- [x] `source` command
- [x] `.` (dot) command
- [x] Handle quoted paths
- [x] Handle variable paths

### Export Queries (`src/queries/exports.ts`)
- [x] `export VAR=value`
- [x] `export -f function_name`
- [x] `declare -x VAR`
- [x] `typeset -x VAR`

### Doc Comment Queries (`src/queries/docs.ts`)
- [x] Comment blocks before functions
- [x] Single-line comments
- [x] Inline comments

## ✅ Phase 3: Transform Functions (COMPLETED)

### Parameter Extraction (`src/transforms/params.ts`)
- [x] Scan function body for $1, $2, etc.
- [x] Detect $@ and $* (rest parameters)
- [x] Handle ${N:-default} syntax
- [x] Infer parameter count from highest reference

### Body Normalization (`src/transforms/normalize.ts`)
- [x] Normalize line endings
- [x] Handle here-doc tab stripping
- [x] Preserve content structure

### Export Detection (`src/transforms/exports.ts`)
- [x] Detect `export -f function_name`
- [x] Handle multiple export formats

### Import Parsing (`src/transforms/imports.ts`)
- [x] Extract literal paths
- [x] Handle quoted paths
- [x] Detect variable paths

### Doc Comment Parsing (`src/transforms/docs.ts`)
- [x] Strip hash prefix
- [x] Trim whitespace
- [x] Preserve content

## ✅ Phase 4: Testing (COMPLETED)

### Unit Tests
- [x] parseParams tests (7 tests)
- [x] normalizeBody tests (6 tests)
- [x] isExported tests (5 tests)
- [x] parseImport tests (7 tests)
- [x] parseDocComment tests (5 tests)
- [x] Query validation tests

### Integration Tests
- [x] Complete grammar definition test
- [x] Query S-expression validation
- [x] Transform function verification

**Total: 35 tests passing**

## Future Enhancements

- [ ] Add CI workflow for automated testing
- [ ] Add release workflow for JSR publishing
- [ ] Support for more shell variants (zsh-specific, fish)
- [ ] Handle arithmetic expressions in parameter defaults
- [ ] Support for associative arrays
- [ ] Function local variable detection
