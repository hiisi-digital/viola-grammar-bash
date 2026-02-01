#!/bin/bash
# Test fixtures for Bash function definitions

# Function with keyword and parentheses
function foo() {
    echo "foo"
}

# POSIX-style function
bar() {
    echo "bar"
}

# Function with keyword without parentheses
function baz {
    echo "baz"
}

# Function with positional parameters
function greet() {
    local name="$1"
    local greeting="${2:-Hello}"
    echo "$greeting, $name!"
}

# Function with rest parameters
function process_all() {
    for arg in "$@"; do
        echo "Processing: $arg"
    done
}

# Function with multiple parameter patterns
function complex() {
    local first="$1"
    local second="${2:-default}"
    local third="${3-fallback}"
    shift 3
    echo "Rest: $@"
}

# Nested functions
function outer() {
    local x="$1"
    
    function inner() {
        local y="$1"
        echo "$y"
    }
    
    echo "$x"
}

# Empty function
function empty() {
    :
}

# Function with here-document
function with_heredoc() {
    cat <<EOF2
This is a here-document
with multiple lines
EOF2
}

# Function with tab-stripped here-document
function with_tab_heredoc() {
    cat <<-EOF3
This content has tabs
that should be stripped
EOF3
}

# Exported function
function exported_func() {
    echo "I am exported"
}
export -f exported_func
