## ADL: WA_101 Warrior Athlete 


This repository contains the source files for the WA_101 edX course and WA_101 edX course extensions.

The Warrior Athlete Challenge is a step-by-step, highly achievable program for you to get fit and healthy. It emphasizes particular aspects of physical health that are designed to help you in your military operational readiness and career.

This challenge is highly self-directed. You need to be on your game in terms of honestly assessing your strengths, weaknesses, and progress towards goals.

The course is being developed by ADL's Applications Thrust team on the [edX course development platform](https://www.edx.org/). EdX was created for students and institutions that seek to transform themselves through cutting-edge technologies, innovative pedagogy, and rigorous courses.

Through edX's institutional partners, the xConsortium, along with other leading global members, they present the best of higher education online, offering opportunity to anyone who wants to achieve, thrive, and grow.

edX's goals, however, go beyond offering courses and content. They are committed to research that will allow educators and course developers to understand how students learn, how technology can transform learning, and the ways teachers teach on campus and beyond.

The edX platform is available as open source. By conducting and publishing significant research on how students learn, they will empower and inspire educators around the world and promote success in learning.

**edX Developer’s Guide:**

[http://userdocs.readthedocs.org/en/latest/index.html](http://userdocs.readthedocs.org/en/latest/index.html)

**Developer vs. Production Stack**

[Developer Stack](https://github.com/edx/configuration/wiki/edX-Developer-Stack)

[Production Stack](https://github.com/edx/configuration/wiki/edX-Production-Stack)

**Developer Resources:**

* [edX demo course](https://www.edx.org/course/edx/edx-edxdemo101-edx-demo-1038#.U8WQknWx3UY)
* [edX open source code home page](http://code.edx.org)
* [edX roadmap](https://edx-wiki.atlassian.net/wiki/display/OPENPROD/Open+edX+Public+Product+Roadmap)
* [Architecture diagrams](https://groups.google.com/forum/#!topic/edx-code/Npgt6WcHPWQ)
* [Ops engineering blog](http://engineering.edx.org/)
* [Developer wiki](https://github.com/edx/edx-platform/wiki/)
* [edX Google Group](https://groups.google.com/forum/#!forum/edx-code)
* [edx101](https://edge.edx.org/courses/edX/edX101/How_to_Create_an_edX_Course/about)
* [Authoring help](http://help.edge.edx.org)
* [Getting started with studio](http://files.edx.org/Getting_Started_with_Studio.pdf)
* [edx studio sandbox](https://studio.sandbox.edx.org)
* Post djangocon: An overview of edX ([a presentation from Yarko](https://www.youtube.com/watch?v=f1FoYwe_DT4) providing an edX overview… lot of history for first 10 minutes)


**Deployment:**

[Scripts to deploy to amazon](https://github.com/edx/configuration)

Interest in porting scripts to other environments.

Documentation is built using rake.  rake -T in the edx-platform directory.


### Creating a Virtual Machine for Development:

For those already running a Linux environment, refer to the developer stack instructions found in the link above. For those running on a Windows environment follow the instructions below to get the VM ready for the edX development stack.

**edX setup on a VMware virtual machine environment as such:**
* VM: VMware v6.0.3
* VM presets:
 * CPUs: 2
 * RAM: 4GB
 * Vitualization Engine: Intel VT-x/EPT or AMD V/RVI with Virtualize Intel VT-x/EPT or AMD V/RVI box checked
* VM OS: [Ubuntu 14.04.1](http://www.ubuntu.com/download)

**Required software to run the edX devstack in Ubuntu Linux:**

install curl

<pre><code>sudo apt-get update
sudo apt-get install curl
</code></pre>

install vagrant 1.5.3:([download 1.5.3 deb package](https://dl.bintray.com/mitchellh/vagrant/vagrant_1.5.3_x86_64.deb))

need libsdl1.2debian to install virtualbox 4.3.12:([download deb package](http://packages.ubuntu.com/precise/amd64/libsdl1.2debian/download))

install virtualbox 4.3.12:([download 4.3.12 deb package](http://download.virtualbox.org/virtualbox/4.3.12/virtualbox-4.3_4.3.12-93733~Ubuntu~raring_amd64.deb))

install nfs:

<pre><code>sudo apt-get install nfs-kernel-server
</code></pre>


**ADL component resources on Github being used in the WA_101 Warrior Athlete course project:**

**[edX Experience API Bridge](https://github.com/adlnet/edx-xapi-bridge)**

**[Sandbox](https://github.com/adlnet/Sandbox)**

**[ADL LRS](https://github.com/adlnet/ADL_LRS)**

**[xAPI-Dashboard](https://github.com/adlnet/xAPI-Dashboard)**


