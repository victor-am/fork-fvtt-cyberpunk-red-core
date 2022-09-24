#!/bin/bash

# Fetch the dev branch
git fetch origin dev >/dev/null 2>&1

# Check that Gitlab has fetched the dev branch
if ! git branch -a | grep -q 'remotes/origin/dev'; then
  echo "remotes/origin/dev branch does not exist"
  exit 1
fi

# Test if the CHANGELOG has been updated
if git diff --quiet HEAD remotes/origin/dev -- CHANGELOG.md; then
  echo "Changelog not changed"
  exit 1
else
  echo "Changelog changed"
  exit 0
fi
