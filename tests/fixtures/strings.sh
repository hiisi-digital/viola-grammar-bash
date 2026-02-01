#!/bin/bash
# Test fixtures for Bash string literals

# Single-quoted strings (no expansion)
single='literal $var'

# Double-quoted strings (with expansion)
double="expanded $var"

# ANSI-C strings
ansi=$'line1\nline2\ttabbed'

# Here-document
cat <<EOF2
This is a here-document
with $variable expansion
EOF2

# Here-document with literal delimiter
cat <<'EOF3'
This is literal
no $variable expansion
EOF3

# Tab-stripped here-document
cat <<-EOF4
Indented content
with tabs
EOF4

# Here-string
grep "pattern" <<<"This is a here-string"

# Empty strings
empty=""
empty_single=''

# Strings with special characters
special="quotes: \"escaped\" and 'mixed'"
