#!/usr/bin/env bash
# Script to check that *.db files in packs/ are sorted alphabetically

# Enable bash strictmode
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# Set error counter to zero
errors=0

# Loop over each .db file we want to sort alphabetically
# Create a sorted version of the .db file
# Then check if the committed db file is the same as the sorted one
# Print how to fix it and log an error if they don't match
cd src/packs
for db in *.db; do
  cat "${db}" | jq --sort-keys -c > foo.db
  if ! diff -s "${db}" foo.db >/dev/null; then
    echo "${db} not sorted alphabetically"
    echo "Please run: 'cat ${db} | jq --sort-keys -c > foo.db && cp foo.db ${db}' and recommit the file."
    ((errors=errors+1))
  fi
  rm -rf foo.db
done

# Check if we have any errors
if [[ $errors -gt 0 ]]; then
  echo "Some db packs are not sorted alphabetically, please see errors above."
  exit 1
fi

# Get out the packs directory and exit gracefully
cd ..
exit 0
