#!/bin/bash

# Script to set up a Django project in a Vagrant container.
# Installation settings
export DEBIAN_FRONTEND=noninteractive

PGSQL_VERSION=9.6
PROJECT_NAME=$1
PROJECT_PATH=/var/www/$PROJECT_NAME
VIRTUALENV_DIR=$PROJECT_PATH/.virtualenvs/$PROJECT_NAME

# Add the Node.js v8 ppa
curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
sudo sh -c "echo deb https://deb.nodesource.com/node_8.x xenial main > /etc/apt/sources.list.d/nodesource.list"
# Add the postgresql ppa
curl -s https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
# Apt needs to update in order to download later on from new repositories
echo "Updating apt sources..." 
apt-get update -qq
# Install Python dev packages
apt-get install -y build-essential python3-dev python3-setuptools libxml2-dev libxslt1-dev
# Install some nice tools to have
apt-get install -y htop git

# Install npm dependencies
if ! command -v npm; then
    apt-get install -y nodejs libssl-dev
    su - vagrant -c "npm install --prefix $PROJECT_PATH/$PROJECT_NAME"
fi

# Postgresql setup
if ! command -v psql; then
    apt-get install -y postgresql-$PGSQL_VERSION postgresql-server-dev-$PGSQL_VERSION
    cp $PROJECT_PATH/setup/files/pg_hba.conf /etc/postgresql/$PGSQL_VERSION/main/
    /etc/init.d/postgresql restart
    # postgresql setup for project
    createdb -U postgres $PROJECT_NAME
fi

# virtualenv global setup
if ! command -v pip3; then
    apt-get install -y python3-pip libffi-dev
fi
if ! command -v virtualenv; then
    pip3 install virtualenv virtualenvwrapper
fi

# bash environment setup
if [ ! -f /home/vagrant/.bash_aliases ]; then
    su - vagrant -c "touch ~/.bash_aliases"
    echo "alias rs='python3 $PROJECT_PATH/$PROJECT_NAME/manage.py runserver 0.0.0.0:8000'
alias shell='python3 $PROJECT_PATH/$PROJECT_NAME/manage.py shell'" > .bash_aliases
    # Set custom bashrc
    cp -p $PROJECT_PATH/setup/files/bashrc /home/vagrant/.bashrc
    echo "export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3" >> /home/vagrant/.bashrc
    echo "export WORKON_HOME=$PROJECT_PATH/.virtualenvs" >> /home/vagrant/.bashrc
    echo "source /usr/local/bin/virtualenvwrapper.sh" >> /home/vagrant/.bashrc
    echo "workon $PROJECT_NAME" >> /home/vagrant/.bashrc
fi

# virtualenv setup for project
su - vagrant -c "/usr/local/bin/virtualenv -p $(which python3) $VIRTUALENV_DIR && \
    echo $PROJECT_PATH > $VIRTUALENV_DIR/.project && \
    $VIRTUALENV_DIR/bin/pip3 install --upgrade pip && \
    $VIRTUALENV_DIR/bin/pip3 install -r $PROJECT_PATH/$PROJECT_NAME/requirements/local.txt"

# Django project setup
su - vagrant -c "source $VIRTUALENV_DIR/bin/activate && \
cd $PROJECT_PATH/$PROJECT_NAME && \
./manage.py makemigrations --noinput && ./manage.py migrate"

exit 0
