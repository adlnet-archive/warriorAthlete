#!/bin/bash

if [ "$1" != "-f" ]; then
	# dump the current course, if nothing is out of sync then all is well
	cd /edx/app/edxapp/edx-platform
	sudo /edx/bin/python.edxapp ./manage.py cms --settings devstack export ADL/WA_101/2014_T1  /warriorAthlete/course
else
	# clean up previous dumps, get ready for new upstream content
	cd /warriorAthlete
	git clean -f
	git reset --hard
fi

cd /warriorAthlete
git pull
if [ $? == 0 ]; then
	cd /edx/app/edxapp/edx-platform
	sudo /edx/bin/python.edxapp ./manage.py cms --settings devstack import /edx/var/edxapp/data /warriorAthlete/course
else
	echo "The local course has changed since last pull. Use -f to overwrite these changes, or do a wa-push first."
fi
