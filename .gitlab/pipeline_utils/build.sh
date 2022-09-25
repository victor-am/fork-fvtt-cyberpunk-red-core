#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Set our variables
SYSTEM_DIR="fvtt-${SYSTEM_NAME}-${CI_COMMIT_TAG}"
SYSTEM_ZIP="cpr.zip"

# Grab the CI JOB number and store it in a .env file for the release stage
# Note: .env file must have the same name in the job in .gitlb-ci.yml
echo CPR_BUILD_JOB_ID="${CI_JOB_ID}" >> build.env

# Build the system
if ! npm run build; then
  echo "Failed to build system using npm build"
fi

# Copy the system.json so we can export it as an artifact
if ! cp dist/system.json system.json; then
  echo "Failed to copt dist/system.json"
fi

# Rename the dist dir so it's the correct name in the zip
if ! mv dist "${SYSTEM_DIR}"; then
  echo "Unable to rename dist"
fi

if ! zip "${SYSTEM_ZIP}" -r "${SYSTEM_DIR}"; then
  echo "Unable to zip ${SYSTEM_NAME}"
fi
