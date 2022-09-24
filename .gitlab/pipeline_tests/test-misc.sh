#!/bin/bash
succeed=1

# Test if our localization code is used (exception for the migration and pause animation).
grep -rn --exclude=cpr-systemUtils.js --exclude=migration.js --exclude=pause-animation.js --exclude=update-popup.js "game.i18n" src/modules/*
# $(echo "$result" | wc -l) cannot count no appearances, thus grep has to be called again.
count=$(grep -rn --exclude=cpr-systemUtils.js --exclude=migration.js --exclude=pause-animation.js --exclude=update-popup.js "game.i18n" src/modules/* | wc -l)
if [ $count != 0 ]
then
    echo "There are" $count "cases, where game.i18n was used instead of our own localization."
    succeed=0
fi

# Test if our notification code is used (exception for the migration)
grep -rn --exclude=cpr-systemUtils.js --exclude=migration.js "ui.notifications" src/modules/*
count=$(grep -rn --exclude=cpr-systemUtils.js --exclude=migration.js "ui.notifications" src/modules/* | wc -l)
if [ $count != 0 ]
then
    echo "There are" $count "cases, where ui.notifications was used instead of our own SystemUtils.DisplayMessage."
    succeed=0
fi

# Check if any test above failed and fail or succed the job accordingly.
if [ $succeed != 1 ]
then
    exit 1
fi

exit 0
