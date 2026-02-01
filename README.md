# @hiisi/viola-grammar-bash

Bash and Shell script grammar package for the [Viola](https://github.com/hiisi-digital/viola) convention linter.

## Overview

This package provides tree-sitter based parsing and extraction for Bash and shell script files. It extracts structured data (functions, strings, imports via `source`, exports) that Viola linters can analyze.

## Installation

```bash
deno add jsr:@hiisi/viola-grammar-bash
```

## Usage

```typescript
import { viola, grammar, when, report } from "@hiisi/viola";
import bash from "@hiisi/viola-grammar-bash";

export default viola()
  // Register grammar
  .add(bash).as("bash")
  
  // Your linter rules
  .rule(report.error, when.in("*.sh"));
```

## Supported File Extensions

- `.sh` - Shell scripts
- `.bash` - Bash scripts

## Supported Globs

Files without extensions that are commonly shell scripts:

- `.bashrc`
- `.bash_profile`
- `.bash_aliases`
- `.profile`

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
- Positional parameters ($1, $2, $@, etc.) - inferred from usage
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
- `$#` - Argument count
- `${N:-default}` - Parameters with default values

### Strings

```bash
single='literal string'           # No variable expansion
double="expanded $variable"       # Variable expansion
heredoc=$(cat <<EOF
Multi-line content
with $variables
EOF
)
```

Captured data:
- Value
- Quote style (single, double, heredoc)

### Imports (source)

```bash
source ./lib/utils.sh
. /etc/profile
source "${SCRIPT_DIR}/config.sh"
```

Captured data:
- Source path
- Import method (`source` or `.`)

### Exports

```bash
export MY_VAR="value"             # Variable export
export -f my_function             # Function export
declare -x EXPORTED_VAR="value"   # Alternative export
```

Captured data:
- Exported name
- Export kind (variable or function)

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

The grammar normalizes various here-document forms:

```bash
# Standard here-doc
cat <<EOF
content
EOF

# Tab-stripped here-doc
cat <<-EOF
	indented content
EOF

# Literal here-doc (no expansion)
cat <<'EOF'
literal $content
EOF
```

All forms are normalized for consistent comparison in linting.

## Example Configuration

```typescript
import { viola, report, when, Impact, grammar } from "@hiisi/viola";
import bash from "@hiisi/viola-grammar-bash";
import defaultLints from "@hiisi/viola-default-lints";

export default viola()
  .add(bash).as("bash")
  .use(defaultLints)
  
  // Stricter rules for production scripts
  .rule(report.error, when.in("scripts/production/**").and(
    when.issue.impact(atLeast(Impact.Minor))
  ))
  
  // Relaxed rules for local dev scripts
  .rule(report.hint, when.in("scripts/dev/**"));
```

## Bash-Specific Considerations

### No Type Information

Unlike TypeScript, Bash has no type system. Functions are analyzed for:
- Parameter usage patterns
- Return values (via `return` or exit codes)
- Side effects (exported variables, file operations)

### Nested Functions

Bash allows nested function definitions. The grammar correctly scopes parameter detection:

```bash
function outer() {
    local x="$1"  # Belongs to outer
    
    function inner() {
        local y="$1"  # Belongs to inner
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
- `@hiisi/viola` ^0.1

## Related Packages

- [@hiisi/viola](https://github.com/hiisi-digital/viola) - Core linter runtime
- [@hiisi/viola-grammar-ts](https://github.com/hiisi-digital/viola-grammar-ts) - TypeScript grammar
- [@hiisi/viola-default-lints](https://github.com/hiisi-digital/viola-default-lints) - Default linter plugins

## License

MPL-2.0
