#!/bin/bash
# make sure we're using our handlebars helpers and that they start with "cpr"
#

helperfile=src/modules/system/register-helpers.js
helpers=$(grep registerHelper $helperfile | awk -F "\"" '{print $2}')
i=0

for helper in $helpers ; do
    grep -rq $helper src/templates/*
    if [ $? != 0 ] ; then
        if [ $helper == "cprDebug" ] || [ $helper == "cprIsDebug" ] ; then
            # it is ok if cprDebug and cprIsDebug are not used anywhere
            echo "$helper is unused, but that is allowed"
        else
            echo "Handlebars helper not used: $helper"
            let "i+=1"
        fi
    elif [ $helper =~ ^cpr.* ] ; then
        echo "Handlers helpers must start with cpr. $helper does not!"
        let "i+=1"
    fi
done

# Flunk if any issues were found
if [ $i -gt 0 ]; then
    echo "$i helpers have issues. Please correct them."
    exit 1
fi

exit 0
