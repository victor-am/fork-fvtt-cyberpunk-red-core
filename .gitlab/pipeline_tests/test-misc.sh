#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

succeed=1

# Check the modules directory exists
modules="src/modules"

if [[ ! -d "${modules}" ]]; then
  echo "Unable to find ${modules} directory"
fi


# Count instances of "game.i18n" in modules
# Shortcut to true as we test this after so we can give an error message
count=$(grep \
  --recursive \
  --line-number \
  --exclude=cpr-systemUtils.js \
  --exclude=migration.js \
  --exclude=pause-animation.js \
  --exclude=update-popup.js \
  "game.i18n" \
  "${modules}"/* \
  | wc -l \
  || true
)

if [[ "${count}" != 0 ]];then
    echo "There are ${count} cases, where game.i18n was used instead of our own localization."
    succeed=0
fi

# Count instances of "ui.notifications" in modules
# Shortcut to true as we test this after so we can give an error message
count=$(grep \
  --recursive \
  --line-number \
  --exclude=cpr-systemUtils.js \
  --exclude=migration.js \
  "ui.notifications" \
  "${modules}"/* \
  | wc -l \
  || true
)

if [[ "${count}" != 0 ]]; then
    echo "There are ${count} cases, where ui.notifications was used instead of our own SystemUtils.DisplayMessage."
    succeed=0
fi

# Check if any test above failed and fail or succed the job accordingly.
if [[ "${succeed}" != 1 ]]; then
    exit 1
fi
