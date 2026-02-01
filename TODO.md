# TODO - viola-grammar-bash

Bash/Shell grammar package for Viola convention linter.

## Phase 1: Foundation

### Setup
- [ ] Initialize deno.json with package metadata
- [ ] Set up imports for @hiisi/viola/grammars
- [ ] Configure tree-sitter-bash npm dependency
- [ ] Create basic module structure

### Grammar Definition
- [ ] Create `src/grammar.ts` with GrammarDefinition
- [ ] Configure meta (id, name, extensions, globs)
- [ ] Configure grammar source (npm package reference)
- [ ] Export from mod.ts

## Phase 2: Extraction Queries

### Function Queries (`src/queries/functions.ts`)
- [ ] Function definitions with `function` keyword
- [ ] POSIX-style function definitions (name() {})
- [ ] Function keyword without parentheses
- [ ] Capture: name, body

### String Queries (`src/queries/strings.ts`)
- [ ] Single-quoted strings (raw, no expansion)
- [ ] Double-quoted strings (with expansion)
- [ ] ANSI-C strings ($'...')
- [ ] Here-documents
- [ ] Here-strings (<<<)

### Import Queries (`src/queries/imports.ts`)
- [ ] `source` command
- [ ] `.` (dot) command
- [ ] Handle quoted paths
- [ ] Handle variable paths

### Export Queries (`src/queries/exports.ts`)
- [ ] `export VAR=value`
- [ ] `export -f function_name`
- [ ] `declare -x VAR`
- [ ] `typeset -x VAR`

### Doc Comment Queries (`src/queries/docs.ts`)
- [ ] Comment blocks before functions
- [ ] Single-line comments
- [ ] Inline comments

## Phase 3: Transform Functions

### Positional Parameter Extraction (`src/transforms/params.ts`)
- [ ] Scan function body for $1, $2, $3, etc.
- [ ] Detect $@ (all args as array)
- [ ] Detect $* (all args as string)
- [ ] Detect $# (argument count)
- [ ] Detect ${N} syntax
- [ ] Detect ${N:-default} with defaults
- [ ] Infer parameter count from highest reference
- [ ] Handle nested functions (don't count inner params)

### Body Normalization (`src/transforms/normalize.ts`)
- [ ] Strip comments (# ...)
- [ ] Normalize whitespace
- [ ] Handle here-doc normalization
  - [ ] Standard here-docs (<<EOF)
  - [ ] Tab-stripped here-docs (<<-EOF)
  - [ ] Quoted delimiters (<<'EOF')
- [ ] Normalize different quoting styles
- [ ] Preserve command semantics

### Export Detection (`src/transforms/exports.ts`)
- [ ] Detect `export -f function_name` for functions
- [ ] Detect `export VAR` for variables
- [ ] Handle declare/typeset variants
- [ ] Track exported state per function

### Import Parsing (`src/transforms/imports.ts`)
- [ ] Extract source path from source command
- [ ] Handle both `source` and `.`
- [ ] Resolve variable interpolation where possible
- [ ] Extract literal paths

### Doc Comment Parsing (`src/transforms/docs.ts`)
- [ ] Extract comment blocks preceding functions
- [ ] Strip # prefixes
- [ ] Handle multi-line comments
- [ ] Preserve formatting/indentation info

## Phase 4: Testing

### Query Tests
- [ ] Test function query with all syntax forms
- [ ] Test string query with all string types
- [ ] Test import query with source and .
- [ ] Test export query with variables and functions
- [ ] Test doc comment extraction

### Transform Tests
- [ ] Test parseParams with various $N patterns
- [ ] Test $@ and $* detection
- [ ] Test default value detection (${1:-default})
- [ ] Test normalizeBody with here-docs
- [ ] Test normalizeBody with mixed quoting
- [ ] Test export detection accuracy
- [ ] Test import parsing completeness
- [ ] Test doc comment extraction

### Integration Tests
- [ ] Full extraction pipeline test
- [ ] Real-world shell script tests
- [ ] Edge case handling
- [ ] Error recovery tests

### Fixture Files
- [ ] Create test fixtures for common patterns
- [ ] Create edge case fixtures
- [ ] Create real-world script samples

## Phase 5: Documentation & Polish

### Documentation
- [ ] Complete README with usage examples
- [ ] Document all public exports
- [ ] Add JSDoc to all functions
- [ ] Document Bash-specific quirks
- [ ] Create CHANGELOG.md

### Polish
- [ ] Ensure all tests pass
- [ ] Check TypeScript strict mode compliance
- [ ] Verify WASM loading works
- [ ] Test with viola core integration
- [ ] Performance benchmarking
- [ ] Handle Zsh compatibility where possible

## Notes

### Positional Parameters Strategy
```bash
function example() {
    local arg1="$1"           # Param 1
    local arg2="${2:-default}" # Param 2 with default
    shift 2
    local rest="$@"           # Rest of args
}
```

Extraction approach:
1. Parse function body as tree
2. Find all `simple_expansion` and `expansion` nodes
3. Filter for $N, $@, $*, $# patterns
4. Track highest N for param count

### Here-Doc Normalization
```bash
# These should normalize to equivalent form:
cat <<EOF
content
EOF

cat <<-EOF
	content
EOF

cat <<'EOF'
content
EOF
```

### Testing Strategy
- Each query should have corresponding test fixtures
- Test both positive matches and non-matches
- Include edge cases (empty functions, nested functions)
- Test real-world scripts from common projects

### Bash Quirks to Handle
- Functions can be defined in multiple ways
- Parameter references can be indirect (${!var})
- Here-docs can have unusual delimiters
- Comments can appear almost anywhere
- Semicolons are often optional
