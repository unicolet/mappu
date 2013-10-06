#!/bin/sh -ex
#
# Script to install Mappu on a Linux Server
# Supported OSs: Centos 6
#
# (c) 2013 umberto.nicoletti@gmail.com
#
# http://unicolet.github.io/mappu/

# start from a known location
cd /root

# install epel
test -f /etc/yum.repos.d/epel.repo || /bin/rpm -ivh http://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm

# install base packages
/usr/bin/yum -y install git salt-minion

# clone the salt states for mappu and install them
test -d mappu || mkdir mappu
cd mappu
test -d mappu-deploy-tooling || /usr/bin/git clone https://github.com/unicolet/mappu-deploy-tooling.git
cd mappu-deploy-tooling
/usr/bin/git pull
/bin/cp -f salt/minion.conf /etc/salt/minion
test -h /srv/salt || /bin/ln -s $PWD/salt/states/salt /srv/salt
test -h /srv/pillar || /bin/ln -s $PWD/salt/states/pillar /srv/pillar
/etc/init.d/salt-minion restart

# apply states
salt-call state.highstate

