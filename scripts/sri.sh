#!/bin/sh
# Prints <script> tags with integrity hashes for the CDN scripts in index.html. Run on a machine with internet, then paste the output over those tags.
# Usage: sh scripts/sri.sh
for u in \
  https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js \
  https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js \
  https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js \
  https://www.gstatic.com/firebasejs/9.23.0/firebase-functions-compat.js \
  https://www.gstatic.com/firebasejs/9.23.0/firebase-app-check-compat.js \
  https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js
do
  h=$(curl -fsSL "$u" | openssl dgst -sha384 -binary | openssl base64 -A) || exit 1
  echo "<script src=\"$u\" integrity=\"sha384-$h\" crossorigin=\"anonymous\"></script>"
done
