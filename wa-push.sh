#!/bin/sh

cd /edx/app/edxapp/edx-platform
sudo  /edx/bin/python.edxapp ./manage.py cms --settings aws export ADL/WA_101/2014_T1  /warriorAthlete/course
cd /warriorAthlete
git add .
git commit -m "$1"
git pull
git push