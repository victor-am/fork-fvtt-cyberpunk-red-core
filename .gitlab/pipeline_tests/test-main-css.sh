#!/bin/bash
# If there's a file changed in the less folder, main.css should be updated in the branch as well

WORK_DIR=$(mktemp -d)

mkdir ${WORK_DIR}/less

LESS_CHANGED=0

for FILE in $(ls less)
do
  # Dowload less file from origin/dev
  curl -s -f https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/raw/dev/less/${FILE} --output ${WORK_DIR}/less/${FILE}
  if [[ $? -eq 0 ]]
  then
    # Download was successful, compare files
    diff -w ${WORK_DIR}/less/${FILE} ./less/${FILE} >/dev/null
    # If files are different, return code will not be 0
    if [[ $? -ne 0 ]]
    then
      LESS_CHANGED=1
    fi
  else
    # Download unsuccessful, therefore this is a new .less file so there is a change
    LESS_CHANGED=1
  fi
done

if [[ ${LESS_CHANGED} -eq 1 ]]
then
  echo ${WORK_DIR}
  curl -s -f https://gitlab.com/JasonAlanTerry/fvtt-cyberpunk-red-core/-/raw/dev/main.css --output ${WORK_DIR}/main.css 
  diff -w ${WORK_DIR}/main.css ./main.css >/dev/null
  if [[ $? -eq 0 ]]
  then
    echo "CSS less files changed, re-compile main.css using gulp and add/commit/push it to your branch."
    exit 1
  fi
fi

rm -rf ${WORK_DIR}