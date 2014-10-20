#!/bin/sh

cd /edx/app/edxapp/edx-platform
sudo  /edx/bin/python.edxapp ./manage.py cms --settings aws export ADL/WA_101/2014_T1  /warriorAthlete/course
cd /warriorAthlete
git pull
cd /edx/app/edxapp/edx-platform
sudo  /edx/bin/python.edxapp ./manage.py cms --settings aws import /edx/var/edxapp/data /warriorAthlete/course
