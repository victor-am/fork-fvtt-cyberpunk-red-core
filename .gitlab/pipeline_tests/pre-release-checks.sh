#!/bin/bash

# Create an empty "errors" array.
errors=()

# Verify that we don't have the "WIP" string in the changelog.
changelog=CHANGELOG.md

if ! grep -q "WIP" "${changelog}"; then
	errors+=("The string 'WIP' exists in the changelog...")
fi

# Verify the system version is the same as the download zip
systemfile=system.json
system_version=$(grep version "${systemfile}" | awk '{print $2}' | sed 's/^.//;s/..$//')
download_zip=$(jq -r .download "${systemfile}")
if [[ "${download_zip}" != "https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/archive/v${system_version}/fvtt-cyberpunk-red-core-v${system_version}.zip" ]]; then
  errors+=("The expected system version (${system_version}) is not used in the 'download' property within 'system.json'...")
fi

if [[ ${#errors[@]} -gt 0 ]]; then
  echo "#############################################################"
  echo "The following warnings occurred:"
  printf ' - %s\n' "${errors[@]}"
  echo "#############################################################"
  exit 1
fi

echo "No problems found. You can now merge dev into master!"
