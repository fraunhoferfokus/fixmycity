#! /bin/bash
IN=`echo {report*.js,customsearch.js,helper.js,login.js,menu.js,newreport.js,settings.js}`
OUT="./app.min.js"

echo "Old: "
du --apparent-size -hcs $IN

echo "Compiling .."
compiler.jar --js $IN --js_output_file $OUT

echo "New: "
du --apparent-size -hcs $OUT

echo "Compiling more .."
compiler.jar --js ./photo-gap.js --js_output_file ./photo-gap.min.js
compiler.jar --js ./photo-nongap.js --js_output_file ./photo-nongap.min.js
