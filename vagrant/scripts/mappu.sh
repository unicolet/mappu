#!/bin/bash

echo "################################################################"
echo "# Check provision.log for errors                               #"
echo "#                                                              #"
echo "# Adding repositories, updating and installing base pkgs       #"
echo "################################################################"
(
# update
sudo apt-get -y update 

# add repo mgmt utils
sudo apt-get install -y python-software-properties 
sudo apt-get install -y unzip
sudo apt-get install -y curl
sudo apt-get install -y wget 

# add repositories
sudo add-apt-repository ppa:pitti/postgresql 
sudo add-apt-repository ppa:ubuntugis/ppa 
 
# update
sudo apt-get -y update 
) >> provision.log 2>&1

echo "################################################################"
echo "# Installing postgres, postgis and apache2                     #"
echo "################################################################"
#install postgres
(
sudo apt-get install -y postgresql-9.1 libpq-dev 
sudo apt-get install -y postgis 
sudo apt-get install -y apache2 
) >> provision.log 2>&1

mkdir PKG > /dev/null 2>&1 # we can ignore warnings
sudo chown -R vagrant PKG/
cd PKG

if [ -e /opt/tomcat ]; then
	echo "################################################################"
	echo "# Tomcat already installed in /opt/tomcat                       #"
	echo "################################################################"
else
	echo "################################################################"
	echo "# Installing tomcat                                            #"
	echo "################################################################"
	(
	wget http://mirror.nohup.it/apache/tomcat/tomcat-7/v7.0.25/bin/apache-tomcat-7.0.25.tar.gz > /dev/null 2>&1
	tar -zxf apache-tomcat-7.0.25.tar.gz 
	sudo mv apache-tomcat-7.0.25 /opt/ 

	sudo useradd tomcat
	sudo chown -R tomcat.tomcat /opt/apache-tomcat-7.0.25
	sudo ln -s /opt/apache-tomcat-7.0.25 /opt/tomcat
	) >> provision.log 2>&1

	sudo cat >> tomcat7 << EOF
#! /bin/sh
### BEGIN INIT INFO
# Provides:          tomcat7
# Required-Start:    \$remote_fs \$syslog
# Required-Stop:     \$remote_fs \$syslog
# Should-Start:      \$named
# Default-Start:     2 3 4 5
# Default-Stop:      1
# Short-Description: Tomcat7 Application server
# Description:       Tomcat7
### END INIT INFO

set -e

TOMCAT_HOME="/opt/tomcat/"
DAEMON_START="/opt/tomcat/bin/startup.sh"
DAEMON_STOP="/opt/tomcat/bin/shutdown.sh"
PID_FILE="/var/run/tomcat7.pid"

test -x \$DAEMON || exit 0

. /lib/lsb/init-functions

export PATH="\${PATH:+\$PATH:}/usr/sbin:/sbin"


case "\$1" in
  start)
	    log_daemon_msg "Starting tomcat7 daemon" "tomcat7"
	    cd \$TOMCAT_HOME && /bin/su - tomcat -c \${DAEMON_START} && touch \$PID_FILE
	    ;;
  stop)
	    log_daemon_msg "Stopping tomcat7 daemon" "tomcat7"
	    cd \$TOMCAT_HOME && /bin/su - tomcat -c \${DAEMON_STOP} && rm -f \$PID_FILE
	    ;;

  reload|force-reload)
	    log_warning_msg "Reloading tomcat7 daemon: please use restart"
	    ;;

  restart)
	    log_daemon_msg "Restarting tomcat7 daemon (it might take a while)" "tomcat7"
	    cd \$TOMCAT_HOME && /bin/su - tomcat -c \${DAEMON_STOP} && rm -f \$PID_FILE
	    sleep 10
	    cd \$TOMCAT_HOME && /bin/su - tomcat -c \${DAEMON_START} && touch \$PID_FILE
	    ;;

  *)
	    echo "Usage: /etc/init.d/tomcat7 {start|stop|restart}"
	    exit 1
esac

exit 0
EOF

	sudo mv tomcat7 /etc/init.d/tomcat7
	sudo chmod +x /etc/init.d/tomcat7

	cat >> tomcat_cfg << EOF
#!/bin/sh
#
# Global tomcat/java configuration.
# Due to licensing issues you will have to install JDK 1.6 in /opt/jdk MANUALLY
#

if [ -e "/opt/geoserver-gdal-libs/" ]; then
	    export GDAL_DATA="/opt/geoserver-gdal-libs/"
	    export GDAL_DRIVER_PATH="/opt/geoserver-gdal-libs/"
	    export LD_LIBRARY_PATH="/opt/geoserver-gdal-libs/"
	    export PATH="/opt/geoserver-gdal-libs/:\$PATH"
fi

JAVA_HOME="/opt/jdk"
export PATH="\${JAVA_HOME}/bin:\$PATH"
JAVA_OPTS="-Xmx1024M -XX:SoftRefLRUPolicyMSPerMB=36000 -XX:MaxPermSize=128m -XX:+UseParallelGC "

### End of changes
EOF

	sudo cat tomcat_cfg /opt/tomcat/bin/catalina.sh > catalina.sh
	cat catalina.sh | sudo tee /opt/tomcat/bin/catalina.sh  > /dev/null
fi # end of install tomcat

if [ -e /opt/jdk/bin/java ]; then
	echo "################################################################"
	echo "# Java already installed in /opt/jdk                           #"
	echo "################################################################"
else
	echo "################################################################"
	echo "# Installing Java                                              #"
	echo "################################################################"
	(
	# checking for jdk in shared folder
	jdk=`ls -1 /vagrant_data/jdk-6*.bin | head -1`
	echo $jdk
	chmod +x $jdk
	$jdk -noregister
	# find out the full jdk name
	jdk=`ls -1 . | grep jdk1.6* | head -1`
	sudo mv $jdk /opt
	sudo ln -s /opt/$jdk /opt/jdk

	sudo update-rc.d tomcat7 defaults

	) >> provision.log 2>&1
fi

echo "################################################################"
echo "# Creating postgres database (will fail if exists)             #"
echo "################################################################"
(
cat >> /tmp/db.sh << EEOF
#!/bin/bash
psql -c "create user social with password 'social'";
psql -c "create database social with owner social";
EEOF
sudo chmod 755 /tmp/db.sh
sudo su postgres -c /tmp/db.sh
) >> provision.log 2>&1

echo "################################################################"
echo "# Updating postgres database                                   #"
echo "################################################################"

export JAVA_HOME=/opt/jdk
export PATH=$JAVA_HOME/bin:$PATH

export WARFILE=/vagrant_data/mapsocial-0.1.war
if [ ! -e $WARFILE ]; then
	# download from s3
	wget https://s3.amazonaws.com/s3-mappu/mapsocial-0.1.war && mv mapsocial-0.1.war /vagrant_data/
fi;

(
# extract driver and changelog from war
unzip -j $WARFILE WEB-INF/changelog.xml WEB-INF/lib/liquibase-1.9.3.jar WEB-INF/lib/postgresql-8.3-603.jdbc3.jar
# now run liquibase migration
/opt/jdk/bin/java -jar liquibase-1.9.3.jar --classpath=postgresql-8.3-603.jdbc3.jar --changeLogFile=changelog.xml --driver=org.postgresql.Driver --username=social --password=social --url=jdbc:postgresql:social update

) >> provision.log 2>&1

echo "################################################################"
echo "# Installing/Upgrading backend web app                         #"
echo "################################################################"
(
sudo rm -f /opt/tomcat/webapps/mapsocial.war
sudo cp /vagrant_data/mapsocial-0.1.war /opt/tomcat/webapps/mapsocial.war
sudo chown tomcat.tomcat /opt/tomcat/webapps/mapsocial.war
) >> provision.log 2>&1


echo "################################################################"
echo "# Installing Sproutcore frontend                               #"
echo "################################################################"
(
export SCAPP=/vagrant_data/mappu-build-1.0.tgz
if [ ! -e $SCAPP ]; then
        # download from s3
        wget https://s3.amazonaws.com/s3-mappu/mappu-build-1.0.tgz && mv mappu-build-1.0.tgz /vagrant_data/
fi;

sudo tar -zxf $SCAPP -C /var/www/
) >> provision.log 2>&1 

echo "################################################################"
echo "# Installing Geoserver                                         #"
echo "################################################################"
(
if [ ! -e /vagrant_data/geoserver-2.1.3-war.zip ]; then
	curl -O -L http://downloads.sourceforge.net/project/geoserver/GeoServer/2.1.3/geoserver-2.1.3-war.zip
	cp geoserver-2.1.3-war.zip /vagrant_data/
fi
unzip /vagrant_data/geoserver-2.1.3-war.zip geoserver.war
sudo mv geoserver.war /opt/tomcat/webapps/geoserver.war
sudo chown tomcat.tomcat /opt/tomcat/webapps/geoserver.war
) >> provision.log 2>&1

echo "################################################################"
echo "# Configuring apache                                           #"
echo "################################################################"
(
cat > mappu.conf <<EOF
ProxyPass /geoserver ajp://127.0.0.1:8009/geoserver

<Location /geoserver>
Order Allow,Deny
Allow from All
</Location>

<IfModule mod_cache.c>
<IfModule mod_disk_cache.c>
CacheRoot /var/cache/apache2/mod_disk_cache
CacheEnable disk /geoserver/psn/wms
CacheDirLevels 5
CacheDirLength 3
CacheDefaultExpire 3600
</IfModule>
</IfModule>

ProxyPass /mapsocial ajp://127.0.0.1:8009/mapsocial

<Location /mapsocial>
Order Allow,Deny
Allow from All
</Location>

EOF
sudo cp mappu.conf /etc/apache2/conf.d/mappu

sudo a2enmod proxy proxy_ajp
sudo a2enmod cache
sudo a2enmod disk_cache
sudo a2enmod deflate

sudo /etc/init.d/tomcat7 start

sudo /etc/init.d/apache restart
) >> provision.log 2>&1 

echo ""
echo "Installation completed."
echo ""
exit

