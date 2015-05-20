#!/bin/bash

nodejs /var/www/util/dante.js "https://inartes.databox.me/Public/dante/inferno-14" > send.txt
nodejs /var/www/util/util.js "$(cat send.txt)" "https://klaranet.com/home/5edbedfea2005c9feca6c014a6d8b2237d1e54c4113155621e2d7ecb7427c42b/Private/chat/diary/" "In Artes" "https://inartes.databox.me/profile/card#me" "https://inartes.databox.me/profile/artes.jpg"
