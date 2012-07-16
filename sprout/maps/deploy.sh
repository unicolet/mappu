#!/bin/bash

VERSION="1.1"

echo -n "[Version=${VERSION}] Cleaning..."
rm -rf tmp
mkdir tmp
echo "done."
echo -n "[Version=${VERSION}] Building..."
sc-build maps -r -b ${VERSION} > tmp/sc-build.log 2>&1
if [ "$?" != "0" ]; then
	echo "failed, exiting (check tmp/sc-build.log)."
	exit 1;
fi
cd tmp/build
tar -zcf mappu-build-${VERSION}.tgz static
echo "done."
echo -n "[Version=${VERSION}] Uploading..."
s3cmd put --acl-public --guess-mime-type mappu-build-${VERSION}.tgz s3://s3-mappu/mappu-build-${VERSION}.tgz
echo "done."
cd - 
