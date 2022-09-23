#!/bin/bash
# Get all the custom handlebar helper functions
handlebar_helpers="./modules/system/register-helpers.js"
strings=$(grep "Handlebars.registerHelper" $handlebar_helpers | awk -F "\"" '{print $2}')

hbs_location="./templates/"
i=0

all_files=$(find $hbs_location -type f -print)

for file in $all_files
do
    #Figure out if a custom handlebar helper is used in the file
    used=0
    for str in $strings
    do
      grep -q $str $file
      if [ $? == 0 ]
      then
          used=1
          break
      fi
    done
    # If a custom handelabr is used check if there are trace statements
    if [ $used != 0 ]
    then
      # Extract the name of the file and convert it to allcaps
      base=$(basename $file | tr a-z A-Z)
      # Create the expected trace statements
      first="{{cprTrace \"START"

      last="{{cprTrace \"END"
      # Look for the starting trace messages in the file
      if [ $(grep "${first}" $file | grep "${base}" | wc -l) != 1 ]
      then
        echo $first "missing/incorrect at the beginning of" $file
        let "i+=1"
      fi
      # Look for the end trace message in the file
      if [ $(grep "${last}" $file | grep "${base}" | wc -l) != 1 ]
      then
        echo $last "missing/incorrect at the end of" $file
        let "i+=1"
      fi
    fi
done
# If some trace messages are missing or incorrect fail this job
if [ $i -gt 0 ]
then
    echo "There are" $i "missing/incorrect trace statements in the hbs files, as listed above."
    echo "A trace statement is required if a handlebar helper is called, which we wrote ourselves."
    echo "Please add or correct the trace statements."
    exit 1
fi

exit 0
