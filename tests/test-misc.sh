#!/bin/bash
succeed=1

# Test if our localization code is used (exception for the migration and pause animation).
result=$(grep -r --exclude=cpr-systemUtils.js --exclude=migration.js --exclude=pause-animation.js "game.i18n" ./modules/*)
echo "$result"
count=$(echo "$result" | wc -l)
if [ count != 0 ]
then
    echo "There are" $count "cases, where game.i18n was used instaead of our own localization."
    succeed=0
fi

# Test if our notification code is used (exceptiuon for the migration)
result=$(grep -r --exclude=cpr-systemUtils.js --exclude=migration.js "ui.notifications" ./modules/*)
echo "$result"
count=$(echo "$result" | wc -l)
if [ count != 0 ]
then
    echo "There are" $count "cases, where ui.notifications was used instaead of our own SystemUtils.DisplayMessage."
    succeed=0
fi

# Check if any test above failed and fail or succed the job accordingly.
if [ succeed != 1 ]
then
    exit 1
fi

exit 0
