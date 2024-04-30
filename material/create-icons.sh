#!/usr/bin/env bash

convert icon.png -resize 128x128 -alpha On sizes/icon-128.png
convert icon.png -resize 96x96 -alpha On sizes/icon-96.png
convert icon.png -resize 72x72 -alpha On sizes/icon-72.png
convert icon.png -resize 48x48 -alpha On sizes/icon-48.png
convert icon.png -resize 36x36 -alpha On sizes/icon-36.png

# app icon for play store
convert icon.png -alpha On sizes/store-icon.png
