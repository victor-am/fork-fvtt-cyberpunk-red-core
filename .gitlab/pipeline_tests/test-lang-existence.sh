#!/bin/bash

# Specify the system.json file location
systemfile=system.json
# Extract the language expected language files from the system.json and remove some characters
langfiles=$(cat $systemfile | jq '.languages | .[] | .path' | tr -d '"' | tr -d '\r')
i=0
for lang in $langfiles
do
  if [ -e $lang ]
  then
    echo $lang "is okay"
  else
    echo $lang "is not okay. File missing!"
    let "i+=1"
  fi
done

if [ $i -gt 0 ]
then
    echo $i "of the above listed languages specified in the system.json are missing the corresponding language file(s). Please add them (via crowdin and an automatically created MR) or correct their location!"
    exit 1
fi

exit 0
