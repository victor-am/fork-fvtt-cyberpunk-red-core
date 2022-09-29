#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# The following vars come from build.sh which creates build.env
# which is then loaded into the env by .gitlab-ci.yml
# REPO_URL, SYSTEM_FILE, VERSION

# NOTE:
# When invoked in this stage of the build (publish) Gulp will overwrite the
# `manifest` url to point to the `latest` url rather then the `version` url
# EG: https://gitlab.com/api/v4/projects/22820629/packages/generic/fvtt-cyberpunk-red-core/latest/system.json
# This allows us to have a permanant location for the system.json while allowing
# per version manifests uploaded as part of the GitLab in release.sh
# EG: https://gitlab.com/api/v4/projects/22820629/packages/generic/fvtt-cyberpunk-red-core/v1.0/system.json

# Build so we can get the `latest` version of the `system.json` file
# Build early to fail early before creating the release in Gitlab
if ! npm run build; then
  echo "❌ Failed to build system using npm build"
  exit 1
else
  echo "✅ Built the system successfully!"
fi

# Copy the system.json so we can export it as an artifact
if ! cp "dist/${SYSTEM_FILE}" "${SYSTEM_FILE}"; then
  echo "❌ Failed to copy 'dist/${SYSTEM_FILE}'"
  exit 1
else
  echo "✅ Successfully copied 'dist/${SYSTEM_FILE}!"
fi

# NOTE: This is done as the last step of the publishing step as this is where Foundry will pick up a new release
# Upload the system.json we created to the `latest` release
response=$(curl \
  --silent \
  --header "JOB-TOKEN: ${CI_JOB_TOKEN}" \
  --upload-file "${SYSTEM_FILE}" \
  "${REPO_URL}/latest/${SYSTEM_FILE}"
)

if [[ "$(echo "${response}" | jq -r .message)" != "201 Created" ]]; then
  echo "❌ Uploading ${SYSTEM_FILE} failed, please see the message below"
  echo "❌ ${response}"
  exit 1
else
  echo "✅ Uploaded ${SYSTEM_FILE} successfully"
fi
