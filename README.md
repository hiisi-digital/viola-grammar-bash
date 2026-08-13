# @hiisi/viola-grammar-bash

Bash and shell script grammar package for the [Viola](https://github.com/hiisi-digital/viola) convention linter.

## Overview

This package provides tree-sitter based parsing and extraction for Bash and shell script files. It extracts structured data (functions, strings, imports via `source`, exports) that Viola linters can analyze.

## Installation

```bash
deno add jsr:@hiisi/viola-grammar-bash
```

## Usage

```typescript
import { viola, report, when } from "@hiisi/viola";
import bash from "@hiisi/viola-grammar-bash";

export default viola()
  // register the grammar
  .add(bash).as("bash")
  
  // your linter rules
  .rule(report.error, when.in("*.sh"));
```

## Supported File Extensions

- `.sh` - Shell scripts
- `.bash` - Bash scripts
- `.zsh` - Zsh scripts

## Supported Globs

Files without extensions that are commonly shell scripts:

- `.bashrc`
- `.bash_profile`
- `.bash_aliases`
- `.profile`
- `.zshrc`

## Extracted Data

### Functions

All Bash function forms are extracted:

```bash
# Keyword syntax with parentheses
function greet() {
    echo "Hello, $1!"
}

# POSIX syntax
say_goodbye() {
    echo "Goodbye, $1!"
}

# Keyword syntax without parentheses
function helper {
    echo "Helping..."
}
```

Captured data:
- Name
- Body (raw and normalized)
- Positional parameters ($1, $2, $@, etc.), inferred from usage
- Export status (via `export -f`)

### Positional Parameters

Unlike other languages, Bash functions don't declare parameters. This grammar analyzes function bodies to extract parameter usage:

```bash
function process_file() {
    local input="$1"              # First parameter
    local output="${2:-output}"    # Second parameter with default
    local verbose="$3"            # Third parameter
    
    for arg in "$@"; do           # All arguments
        process "$arg"
    done
}
```

Detected patterns:
- `$1`, `$2`, `$3`, etc. - Positional parameters
- `$@` - All arguments as separate words
- `$*` - All arguments as single string
- `${N:-default}` and `${N-default}` - Parameters with default values

### Strings

```bash
single='literal string'           # no variable expansion
double="expanded $variable"       # variable expansion
ansi=$'escaped\nstring'           # escape sequences
heredoc=$(cat <<EOF
Multi-line content
with $variables
EOF
)
```

Captured data:
- Value (quotes stripped)
- Quote style (single or double; here-document bodies carry no quotes and report as double)

### Imports (source)

```bash
source ./lib/utils.sh
. /etc/profile
source "${SCRIPT_DIR}/config.sh"
```

Captured data:
- Source path (quotes stripped; also used as the import name)

Both forms are treated identically, and sourcing marks the import as a namespace import since it brings every definition from the target file into scope.

### Exports

```bash
export MY_VAR="value"             # variable export
export PLAIN_VAR                  # export without assignment
export -f my_function             # function export
declare -x EXPORTED_VAR="value"   # alternative export
typeset -x TYPESET_VAR="value"    # alternative export
```

Captured data:
- Exported name

### Comments

```bash
# This is a documentation comment
# for the function below
function documented() {
    # Implementation comment
    echo "Hello"
}
```

## Here-Document Handling

The grammar recognizes the standard here-document forms and extracts their bodies as string values:

```bash
# standard here-doc
cat <<EOF
content
EOF

# tab-stripped here-doc
cat <<-EOF
	indented content
EOF

# literal here-doc (no expansion)
cat <<'EOF'
literal $content
EOF
```

Function bodies containing here-documents are normalized for comparison by the `normalizeBody` transform, which normalizes line endings and trims surrounding whitespace.

## Example Configuration

```typescript
import { viola, report, when, Impact } from "@hiisi/viola";
import bash from "@hiisi/viola-grammar-bash";
import defaultLints from "@hiisi/viola-default-lints";

export default viola()
  .add(bash).as("bash")
  .use(defaultLints)
  
  // stricter rules for production scripts
  .rule(report.error, when.in("scripts/production/**").and(
    when.impact.atLeast(Impact.Minor)
  ))
  
  // relaxed rules for local dev scripts
  .rule(report.hint, when.in("scripts/dev/**"));
```

## Bash-Specific Considerations

### No Type Information

Unlike TypeScript, Bash has no type system. Functions are analyzed for parameter usage patterns (positional parameter references in the body) and export status (via `export -f`).

### Nested Functions

Bash allows nested function definitions. Each definition is extracted as its own function. Parameter detection scans the full body text of a function, so parameter references inside a nested function also count toward the enclosing function:

```bash
function outer() {
    local x="$1"  # detected for outer
    
    function inner() {
        local y="$1"  # detected for inner, and also for outer
    }
}
```

### Dynamic Evaluation

The grammar cannot extract dynamically evaluated code:

```bash
# Cannot be statically analyzed
eval "function dynamic_${name}() { echo 'dynamic'; }"
```

## Requirements

- Deno 2.0+
- `@hiisi/viola` ^0.3

## Related Packages

- [@hiisi/viola](https://github.com/hiisi-digital/viola) - Core linter runtime
- [@hiisi/viola-grammar-ts](https://github.com/hiisi-digital/viola-grammar-ts) - TypeScript grammar
- [@hiisi/viola-default-lints](https://github.com/hiisi-digital/viola-default-lints) - Default linter plugins

## License

MPL-2.0
