#!/bin/sh

if [ "$1" != '-f' ]; then
	cd /edx/app/edxapp/edx-platform
	sudo /edx/bin/python.edxapp ./manage.py cms --settings aws export ADL/WA_101/2014_T1  /warriorAthlete/course
fi
cd /warriorAthlete
git pull
if [ -z $? ]; then
	cd /edx/app/edxapp/edx-platform
	sudo /edx/bin/python.edxapp ./manage.py cms --settings aws import /edx/var/edxapp/data /warriorAthlete/course
else
	echo "The local course has changed since last pull. Use -f to overwrite these changes, or do a wa-push first."
fi
