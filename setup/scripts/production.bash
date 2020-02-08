#!/bin/bash

# This script will setup the production state.  
# Installation settings
PGSQL_VERSION=9.6
PROJECT_NAME=$(hostname | cut -f1 -d"-")
PROJECT_PATH=/var/www/$PROJECT_NAME
VIRTUALENV_DIR=$PROJECT_PATH/.virtualenvs/$PROJECT_NAME

# Add the Node.js v8 ppa
curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
sudo sh -c "echo deb https://deb.nodesource.com/node_8.x xenial main > /etc/apt/sources.list.d/nodesource.list"
# Add the postgresql ppa
curl -s https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
sudo sh -c "echo deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main > /etc/apt/sources.list.d/pgdg.list"
# Apt needs to update in order to download later on from new repositories
echo "Updating apt sources..." 
apt-get update -qq

# Install Python dev packages
apt-get install -y build-essential python3-dev python3-setuptools libxml2-dev libxslt1-dev

# Install apache packages
if ! command -v apache2; then
    apt-get install -y apache2 apache2-dev libapache2-mod-shib2
    a2dismod autoindex status -f
    a2enmod headers ssl
fi
# Generate apache config file
/bin/bash $PROJECT_PATH/setup/scripts/apacheconf.bash
# Generate SSL key and csr if they don't already exist
if [ ! -f /etc/ssl/certs/$(hostname).fso.arizona.edu.key ]; then
    openssl req -nodes -newkey rsa:2048 -keyout /etc/ssl/certs/$(hostname).fso.arizona.edu.key -out /etc/ssl/certs/$(hostname).fso.arizona.edu.csr -subj "/C=US/ST=Arizona/L=Tucson/O=University of Arizona/OU=FSO/CN=$(hostname).fso.arizona.edu"
fi
# Generate SSL key and csr for shibboleth if they don't already exist
if [ ! -f /etc/shibboleth/sp-cert.pem ]; then
    openssl req -nodes -newkey rsa:2048 -keyout /etc/shibboleth/sp-key.pem -out /etc/shibboleth/sp.csr -subj "/C=US/ST=Arizona/L=Tucson/O=University of Arizona/OU=FSO/CN=$(hostname).fso.arizona.edu"
    openssl x509 -req -days 365 -in /etc/shibboleth/sp.csr -signkey /etc/shibboleth/sp-key.pem -out /etc/shibboleth/sp-cert.pem
fi

# Install npm dependencies
if ! command -v npm; then
    apt-get install -y nodejs libssl-dev
    su - scriptuser -c "npm install --prefix $PROJECT_PATH/$PROJECT_NAME"
fi

# Postgresql setup
if ! command -v psql; then
    apt-get install -y postgresql-client-$PGSQL_VERSION
fi

# virtualenv global setup
if ! command -v pip3; then
    apt-get install -y python3-pip libffi-dev
fi
if ! command -v virtualenv; then
    pip3 install virtualenv virtualenvwrapper
fi

# virtualenv environment global setup
echo "export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3
export WORKON_HOME=$PROJECT_PATH/.virtualenvs
source /usr/local/bin/virtualenvwrapper.sh" > /etc/profile.d/webapp.sh

# virtualenv setup for project
su - scriptuser -c "/usr/local/bin/virtualenv -p $(which python3) $VIRTUALENV_DIR && \
$VIRTUALENV_DIR/bin/pip3 install --upgrade pip && \
$VIRTUALENV_DIR/bin/pip3 install -r $PROJECT_PATH/$PROJECT_NAME/requirements/production.txt"

# Setup global wsgi needed for Python 3.5
if [ ! -f /etc/apache2/mods-available/wsgi_express.load ]; then
    $VIRTUALENV_DIR/bin/mod_wsgi-express install-module >/dev/null
    echo "LoadModule wsgi_module /usr/lib/apache2/modules/mod_wsgi-py35.cpython-35m-x86_64-linux-gnu.so" > /etc/apache2/mods-available/wsgi_express.load
    echo "WSGIPythonHome $VIRTUALENV_DIR" > /etc/apache2/mods-available/wsgi_express.conf
    a2enmod wsgi_express
fi

exit 0
