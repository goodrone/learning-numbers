#!/bin/bash
set -eu
DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$DIR"

echo "Checking out code from origin/master..."
git fetch origin
git checkout -q --detach origin/master
yarn
rm -rf build
npm run build

TrackingID=${1:-}
if [[ $TrackingID == "" ]]; then
    echo "Tracking ID is not set.  Done"
    exit 0
fi
IndexFile=build/index.html
test -f "$IndexFile"
echo "Applying tracking ID $TrackingID to $IndexFile..."
sed -i -e "s@</body>@<script async src='https://www.googletagmanager.com/gtag/js?id=$TrackingID'></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);};gtag('js',new Date());gtag('config','$TrackingID');</script></body>@g" "$IndexFile"

echo "Done"
