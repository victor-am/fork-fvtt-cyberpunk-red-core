#!/bin/bash
langfile=lang/en.json
# Load all localization identifiers from the English language file
strings=$(grep CPR $langfile | awk -F "\"" '{print $2}')
i=0
# Iterate through them and check if they exist elsewhere in the code
for str in $strings
do
    grep -rq --exclude-dir=lang --exclude-dir=node_modules $str ./*
    if [ $? != 0 ]
    then
        echo "String not used:" $str
        let "i+=1"
    fi
done
# If some do not exist elsewhere in the code fail this job
if [ $i -gt 0 ]
then
    echo "The above listed" $i "strings are not in use. Please remove or use them."
    exit 1
fi

exit 0
