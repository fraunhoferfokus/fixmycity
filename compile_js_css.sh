#! /bin/bash
#/*******************************************************************************
# * 
# * Copyright (c) 2015 Fraunhofer FOKUS, All rights reserved.
# * 
# * This library is free software; you can redistribute it and/or
# * modify it under the terms of the GNU Lesser General Public
# * License as published by the Free Software Foundation; either
# * version 3.0 of the License, or (at your option) any later version.
# * 
# * This library is distributed in the hope that it will be useful,
# * but WITHOUT ANY WARRANTY; without even the implied warranty of
# * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# * Lesser General Public License for more details.
# * 
# * You should have received a copy of the GNU Lesser General Public
# * License along with this library. If not, see <http://www.gnu.org/licenses/>. 
# * 
# * AUTHORS: Louay Bassbouss (louay.bassbouss@fokus.fraunhofer.de)
# *
# ******************************************************************************/


DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"


# JavaScript compression
cd $DIR/mob/static/fmc-mob/js/

IN_JS=`echo {report*.js,customsearch.js,helper.js,login.js,menu.js,newreport.js,settings.js}`
OUT_JS="./app.min.js"

echo "Old size: "
du --apparent-size -hcs $IN_JS

echo -en "\nCompiling .."
compiler.jar --js $IN_JS --js_output_file $OUT_JS

echo -e ". done!\n\nNew size: "
du --apparent-size -hcs $OUT_JS

echo -en "\nCompiling photo scripts .."
compiler.jar --js ./photo-gap.js --js_output_file ./photo-gap.min.js
compiler.jar --js ./photo-nongap.js --js_output_file ./photo-nongap.min.js
echo -e ". done!"


# CSS compression
cd $DIR/mob/static/fmc-mob/css/
IN_CSS=`echo *.css`
OUT_CSS="./style.min.css"

echo -en "\nCompiling CSS .."
yuicompressor.jar $IN_CSS -o $OUT_CSS

echo ". done!"
