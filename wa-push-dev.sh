#!/bin/bash

cd /edx/app/edxapp/edx-platform;
echo "Removing old course";
rm -rf /warriorAthlete/course;
sudo /edx/bin/python.edxapp ./manage.py cms --settings devstack export ADL/WA_101/2014_T1  /warriorAthlete/course;
cd /warriorAthlete;
git add course;
git commit -a -m "$1";
git fetch;
if git merge origin/development;
then
	git push origin development;
else
	echo "Automatic merge failed. You have changed some of the same files as upstream. See an admin."
fi
