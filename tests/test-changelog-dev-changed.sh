#!/bin/bash
# Download the original changelog from dev branch.
wget http://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/raw/dev/CHANGELOG.md /tmp/CHANGELOG.md

if cmp -s /tmp/CHANGELOG.md CHANGELOG.md; then       ## Checking if files are different.
    echo "Changelog not changed"
    exit 1                                           ## Job will fail
else
    echo "Changelog changed"
    exit 0                                           ## Job will pass
fi
