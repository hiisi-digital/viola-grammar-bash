# viola-grammar-bash Design Document

## Overview

`@hiisi/viola-grammar-bash` is a grammar package for the Viola convention linter that enables parsing and extraction of structured data from Bash and shell script files using tree-sitter.

## Purpose

This package provides:

1. **Tree-sitter grammar configuration** for Bash/Shell scripts
2. **Extraction queries** in S-expression format for capturing code elements
3. **Transform functions** for Bash-specific extraction logic

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              @hiisi/viola-grammar-bash              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────┐    ┌──────────────────────┐   │
│  │  GrammarMeta    │    │   GrammarSource      │   │
│  │  - id: "bash"   │    │   - npm package ref  │   │
│  │  - extensions   │    │   - WASM file path   │   │
│  │  - globs        │    │                      │   │
│  └─────────────────┘    └──────────────────────┘   │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │            Extraction Queries                 │  │
│  │  - functions (function definitions)          │  │
│  │  - strings (literals, quoted strings)        │  │
│  │  - imports (source, .)                       │  │
│  │  - exports (export, export -f)               │  │
│  │  - docComments (# comment blocks)            │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │            Transform Functions                │  │
│  │  - parseParams: extract $1, $2, $@, $*      │  │
│  │  - normalizeBody: normalize here-docs,       │  │
│  │                   handle quoting styles      │  │
│  │  - isExported: detect export -f              │  │
│  │  - parseImport: handle source/.             │  │
│  │  - parseDocComment: extract # blocks        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Bash-Specific Challenges

### 1. Positional Parameters

Bash functions don't declare parameters; they use positional variables:

```bash
function greet() {
    local name="$1"
    local greeting="${2:-Hello}"
    echo "$greeting, $name!"
}
```

The `parseParams` transform must:
- Scan function body for `$1`, `$2`, `$3`, etc.
- Detect `$@` (all args as separate words)
- Detect `$*` (all args as single string)
- Detect `$#` (argument count)
- Infer parameter count from highest numbered reference

### 2. Here-Documents

Here-docs have multiple forms that need normalization:

```bash
cat <<EOF
content here
EOF

cat <<'EOF'   # No variable expansion
content here
EOF

cat <<-EOF    # Strip leading tabs
	content here
EOF
```

The `normalizeBody` transform must:
- Handle different delimiter styles
- Normalize `<<-` (tab-stripped) variants
- Preserve content semantics while normalizing format

### 3. Quoting Styles

Bash has multiple quoting mechanisms:

```bash
single='literal $var'      # No expansion
double="expanded $var"     # Variable expansion
backtick=`command`         # Command substitution (legacy)
modern=$(command)          # Command substitution (modern)
```

String extraction must:
- Distinguish quote styles
- Track expansion vs literal strings
- Handle nested quoting

### 4. Function Definition Styles

Bash supports multiple function syntaxes:

```bash
# Keyword syntax
function foo() {
    echo "foo"
}

# POSIX syntax
bar() {
    echo "bar"
}

# Keyword without parens
function baz {
    echo "baz"
}
```

### 5. Source/Import Detection

Bash imports via `source` or `.`:

```bash
source ./lib/utils.sh
. /etc/profile
source "${SCRIPT_DIR}/config.sh"
```

### 6. Export Detection

Bash exports variables and functions differently:

```bash
export VAR="value"         # Variable export
export -f function_name    # Function export
declare -x VAR="value"     # Alternative export
```

## Query Design

### Capture Naming Convention

Following Viola's standard capture names:
- `@function.name`, `@function.body`
- `@string.value`
- `@import.from`
- `@export.name`, `@export.kind`
- `@doc.content`

### Function Extraction

```scheme
; Function with keyword
(function_definition
  name: (word) @function.name
  body: (compound_statement) @function.body) @function

; POSIX-style function
(function_definition
  name: (word) @function.name
  body: (compound_statement) @function.body) @function
```

### String Extraction

```scheme
; Single-quoted strings
(raw_string) @string.value

; Double-quoted strings
(string) @string.value

; Command substitution
(command_substitution) @string.value
```

### Import Detection

```scheme
; source command
(command
  name: (command_name) @_cmd
  argument: (_) @import.from
  (#match? @_cmd "^(source|\\.)$")) @import
```

## File Structure

```
viola-grammar-bash/
├── mod.ts                 # Main export (GrammarDefinition)
├── deno.json             # Package manifest
├── README.md             # Usage documentation
├── DESIGN.md             # This file
├── TODO.md               # Implementation tasks
├── LICENSE               # MPL-2.0
├── src/
│   ├── grammar.ts        # GrammarDefinition
│   ├── queries/
│   │   ├── functions.ts  # Function extraction queries
│   │   ├── strings.ts    # String literal queries
│   │   ├── imports.ts    # Source/. command queries
│   │   ├── exports.ts    # Export statement queries
│   │   └── docs.ts       # Comment block queries
│   ├── transforms/
│   │   ├── params.ts     # Positional parameter extraction
│   │   ├── normalize.ts  # Here-doc/body normalization
│   │   ├── exports.ts    # Export detection
│   │   ├── imports.ts    # Source/. parsing
│   │   └── docs.ts       # Comment block parsing
│   └── mod.ts            # Internal exports
└── tests/
    ├── functions_test.ts
    ├── params_test.ts
    ├── strings_test.ts
    ├── imports_test.ts
    └── normalize_test.ts
```

## Dependencies

- `@hiisi/viola/grammars` - Grammar type definitions
- `tree-sitter-bash` - Tree-sitter grammar (npm, loaded as WASM)

## Usage

```typescript
import { viola, grammar, when } from "@hiisi/viola";
import bash from "@hiisi/viola-grammar-bash";

export default viola()
  .add(bash).as("bash")
  .rule(report.error, when.in("*.sh"));
```

## Supported Files

### By Extension
- `.sh` - Shell scripts
- `.bash` - Bash scripts
- `.zsh` - Zsh scripts (partial support)

### By Glob Pattern
- `.bashrc`
- `.bash_profile`
- `.bash_aliases`
- `.profile`
- `.zshrc`

## Testing Strategy

1. **Unit tests** for each transform function
2. **Query tests** with known Bash snippets
3. **Positional parameter detection tests**
4. **Here-doc normalization tests**
5. **Real-world script tests**

## Known Limitations

1. **Zsh-specific syntax** may not be fully supported
2. **Complex here-docs** with unusual delimiters might not normalize perfectly
3. **Computed function names** (via eval) cannot be statically extracted
4. **Aliased functions** (alias foo=bar) not tracked

## Performance Considerations

1. **Body scanning**: Positional parameter extraction scans function bodies
2. **Regex patterns**: Use efficient patterns for $N detection
3. **Here-doc handling**: Avoid re-parsing normalized content
4. **Caching**: Cache extracted parameter lists per function
