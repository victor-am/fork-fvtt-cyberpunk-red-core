#!/bin/bash

# Create an empty "errors" array.
errors=()

# Verify that we don't have the "WIP" string in the changelog.
changelog=CHANGELOG.md

grep "WIP" $changelog > /dev/null
if [ $? -eq 0 ]
then
	errors+=("WIP exists in the changelog")
fi

# Verify the system version is the same as the download zip
systemfile=system.json
system_version=$(grep version $systemfile | awk '{print $2}' | sed 's/^.//;s/..$//')
download_zip=$(cat $systemfile | jq .download)
if [[ $download_zip != *$system_version* ]]
then
  errors+=("The expected system version ($system_version) isn't in the download.zip value")
fi

if [ ${#errors[@]} -gt 0 ]
then
  echo "#############################################################"
  echo "The following warnings occurred:"
  printf ' - %s\n' "${errors[@]}"
  echo "#############################################################"
  exit 1
fi

echo "No problems found. You should now merge dev into master!"