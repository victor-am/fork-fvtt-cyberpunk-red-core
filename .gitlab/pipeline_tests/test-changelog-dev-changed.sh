#!/bin/bash
# Download the original changelog from dev branch.
WORK_DIR=$(mktemp -d)
wget -O ${WORK_DIR}/CHANGELOG.md https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/raw/dev/CHANGELOG.md

if cmp -s ${WORK_DIR}/CHANGELOG.md CHANGELOG.md; then       ## Checking if files are different.
    echo "Changelog not changed"
    rm -rf ${WORK_DIR}
    exit 1                                           ## Job will fail
else
    echo "Changelog changed"
    rm -rf ${WORK_DIR}
    exit 0                                           ## Job will pass
fi
