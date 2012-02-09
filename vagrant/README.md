QUICK DEPLOY WITH VAGRANT
=========================

*This is a work in progress, we're almost there*

Requires that you have a working vagrant install:

http://vagrantup.com/

Usage:

create a install-data directory:

    mkdir install-data

then put a recent copy of JDK 1.6 into that folder.
It will be used as the default jdk for tomcat and it cannot
be automatically deployed due to licensing issues.

Grab your copy from here:

http://www.oracle.com/technetwork/java/javase/downloads/jdk-6u30-download-1377139.html

The installer script scripts/mappu.sh will also automatically download
installer files for Tomcat, Geoserver and Mappu and they will be cached in
install-data so that they don't have to be downloaded over and over.

The content of the install data is safe to delete.

Now download the base box image (need to run it only once) and provision a vm:

    vagrant box add base http://files.vagrantup.com/lucid32.box
    vagrant up

When the vm has started point your browser to one of the reachable vm ips:

    http://your.vm.ip/


