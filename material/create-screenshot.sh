#!/usr/bin/env bash

import root show:

convert -crop 360x640+100+168 /tmp/screenshot.png screenshot1.png
convert -crop 360x640+100+168 /tmp/screenshot.png screenshot2.png

# Funktionsgrafik
convert -crop 1024x500+100+168 /tmp/screenshot.png store-graphic-tmp.png
convert store-graphic-tmp.png sizes/store-icon.png -geometry +500+80 -compose Multiply -composite store-graphic-tmp2.png
convert store-graphic-tmp2.png -font SheerBeauty -pointsize 72 -annotate 350x350+20+90 'Anthony' store-graphic.png
convert store-graphic-tmp2.png -fill white -stroke black -gravity center -font Helvetica -pointsize 72 -annotate 350x350+20+90 'Anthony' store-graphic.png


#convert -size 320x100 xc:lightblue -font Candice -pointsize 72 -annotate 350x350+20+90 'Anthony' annotate_rotated.gif

#convert store-graphic-tmp2.png -font Arial -pointsize 72 -annotate 350x350+20+90 'Anthony' store-graphic.png
