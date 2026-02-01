#!/bin/bash
# Test fixtures for Bash imports and exports

# Import with source
source ./lib/utils.sh

# Import with dot
. ./lib/config.sh

# Import with quoted path
source "./lib/helpers.sh"

# Import with single-quoted path
source './lib/functions.sh'

# Import with variable (cannot be resolved statically)
source "$LIB_DIR/module.sh"

# Export variable
export VAR="value"

# Export multiple variables
export VAR1="value1" VAR2="value2"

# Export function
function my_func() {
    echo "exported"
}
export -f my_func

# Declare with export
declare -x DECLARED_VAR="declared"

# Typeset with export
typeset -x TYPESET_VAR="typeset"
