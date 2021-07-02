langfile=lang/en.json

strings=$(grep CPR $langfile | awk -F "\"" '{print $2}')
i=0

for str in $strings
do
    grep -rq --exclude-dir=lang --exclude-dir=node_modules $str ./*
    if [ $? != 0 ]
    then
        echo "String not used:" $str
        let "i+=1"
    fi
done

if [ $i -gt 0 ]
then
    echo "The above listed" $i "strings are not in use. Please remove or use them."
    exit 1
fi

exit 0
