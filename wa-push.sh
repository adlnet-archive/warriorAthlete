#!/bin/sh

cd /edx/app/edxapp/edx-platform;
sudo /edx/bin/python.edxapp ./manage.py cms --settings aws export ADL/WA_101/2014_T1  /warriorAthlete/course;
cd /warriorAthlete;
git add course;
git commit -m "$1";
git fetch;
if git merge origin/development;
then
	git push origin development;
else
	echo "Automatic merge failed. You have changed some of the same files as upstream. See an admin."
fi
