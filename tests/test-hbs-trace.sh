#!/bin/bash
hbs_location="./templates/"
i=0

all_files=$(find $hbs_location -type f -print)

for file in $all_files
do
    # Extract the name of the file and convert it to allcaps
    base=$(basename $file | tr a-z A-Z)
    # Create the expected trace statements
    first="{{trace \"${base}\"}}"
    last="{{trace \"END ${base}\"}}"
    # Look for the starting trace messages in the file
    if [ $(grep "${first}" $file | wc -l) != 1 ]
    then
      echo $first "missing at the beginning of" $file
      let "i+=1"
    fi
    # Look for the end trace message in the file
    if [ $(grep "${last}" $file | wc -l) != 1 ]
    then
      echo $last "missing at the end of" $file
      let "i+=1"
    fi
done
# If some trace messages are missing or incorrect fail this job
if [ $i -gt 0 ]
then
    echo "There are" $i "missing/incorrect trace statements in the hbs files, as listed above."
    exit 1
fi

exit 0
