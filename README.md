# `viola-grammar-bash`

> Bash and shell script grammar for the viola convention linter.

A tree-sitter based grammar package for [viola](https://github.com/hiisi-digital/viola) that parses Bash and shell scripts and extracts the structured data viola's linters analyze, which is functions, strings, imports through `source` and exports.

## Usage

```bash
deno add jsr:@hiisi/viola-grammar-bash
```

```typescript
import { Impact, report, viola, when } from "@hiisi/viola";
import bash from "@hiisi/viola-grammar-bash";
import defaultLints from "@hiisi/viola-default-lints";

export default viola()
  .add(bash).as("bash")
  .use(defaultLints)
  // stricter rules for production scripts
  .rule(report.error, when.in("scripts/production/**").and(when.impact.atLeast(Impact.Minor)))
  // relaxed rules for local dev scripts
  .rule(report.hint, when.in("scripts/dev/**"));
```

It handles `.sh`, `.bash` and `.zsh` files, and the extensionless `.bashrc`, `.bash_profile`, `.bash_aliases`, `.profile` and `.zshrc`.

## What it extracts

All three function forms are picked up, `function greet() {}`, the POSIX `say_goodbye() {}` and `function helper {}`, with the name, the raw and normalized body, whether it is exported through `export -f`, and its positional parameters. Bash doesn't declare parameters, so those are inferred from the body, from `$1`, `$2` and so on, `$@`, `$*` and the `${N:-default}` forms. Nested functions are each extracted as their own, and since parameter detection scans the full body text, a reference inside a nested function also counts for the one enclosing it.

Strings come with their quote style, single or double, and here-document bodies are extracted as strings too, in the plain, tab-stripped and literal forms, and report as double since they carry no quotes. `source` and `.` are imports and both are treated as namespace imports, since they bring everything in the target file into scope, and exports come from `export`, `export -f`, `declare -x` and `typeset -x`.

Comments are declared in the grammar with a `parseDocComment` transform, but viola's extraction doesn't run either one, so no comment data reaches a linter yet. Code built at runtime, such as `eval "function dynamic_${name}() { ... }"`, can't be analyzed. It needs deno 2.0 or newer and `@hiisi/viola` ^0.3, and the sibling packages are [`viola-grammar-ts`](https://github.com/hiisi-digital/viola-grammar-ts) and [`viola-default-lints`](https://github.com/hiisi-digital/viola-default-lints).

## License

> The project is licensed under the **Mozilla Public License 2.0**.

`SPDX-License-Identifier: MPL-2.0`

> You can check out the full license [here](https://github.com/hiisi-digital/viola-grammar-bash/blob/main/LICENSE)
