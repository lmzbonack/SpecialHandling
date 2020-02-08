django-base-app
===
[![build status](https://gitlab.fso.arizona.edu/FAST/django-base-app/badges/master/build.svg)](https://gitlab.fso.arizona.edu/FAST/django-base-app/commits/master)
[![coverage report](https://gitlab.fso.arizona.edu/FAST/django-base-app/badges/master/coverage.svg)](https://gitlab.fso.arizona.edu/FAST/django-base-app/commits/master)  
<sup>*specialhandling build and coverage badges are in the specialhandling README</sup>

The django-base-app is a templated Django development environment that allows FSOIT to version control the development and production servers along with the underlying web application.

The pre-installed packages and corresponding versions used in this project are:

| Package             | Version  |  Source  |
| ------------------- | :------: | :------: |
| Django              | 1.11     |    pip   |
| djangorestframework | 3.7      |    pip   |
| Node.js             | 8.x      |    apt   |
| postgresql          | 9.6      |    apt   |
| psycopg2            | 2.7      |    pip   |
| Python              | 3.5      |  system  |
| raven               | 6.x      |    pip   |
| simplejson          | 3.12     |    pip   |

Software Requirements
---
Can be installed via Self Service or [homebrew](http://brew.sh/)

* Vagrant
* Virtualbox

Usage
---

**Developers**:  
**_Do not_** edit the .gitignore, CHANGELOG, or README at this level, use the corresponding files located within the `specialhandling` folder.  
To start a new project, clone this repository to your computer and run the setup script located at `setup/utils/startapp` supplying an app name, your name, and NetID as prompted or as shell arguments. Note that the app name should not contain any spaces.
The script will setup the proper naming convention and fill in the package.json author and email fields.

Next, if you would like error logging while working locally you should tie your project in to [Sentry](https://sentry.fso.arizona.edu/organizations/sentry/projects/new/?team=fast). After creating your project in Sentry, add the environment variable `DJANGO_SENTRY_DSN` to `.virtualenv/postactivate` and your app will be configured to log errors. While developing locally, any API Keys or sensitive information should be stored in environment variables exported in the `.virtualenv/postactivate` script.

A few nice to haves and shortcuts are also available while developing locally. Your virtual environment will load automatically once you are ssh'ed in to the vagrant environment. There's an alias for the Django runserver, `rs`, an alias for the Python management shell is also available, `shell`.

When you're ready to begin developing:

    vagrant up
    vagrant ssh
    rs

This will make the application accessible on your local machine at [http://localhost:8000](http://localhost:8000).

If you need to test your application outside of your local machine, for IE/Edge/mobile testing as an example, Vagrant has a `vagrant share` command which generates a sharable temporary URL. This requires [ngrok](https://ngrok.com/) installed on your machine which can be found directly from their website, but it is recommended to install `ngrok` through homebrew.

In an effort to try and keep our code clean and formatted in a similar fashion between multiple developers we use two linting tools that are available for a wide range of IDE's and text editors; [EditorConfig](http://editorconfig.org/) and [Pylint](https://www.pylint.org/). We highly recommend you read their docs on how to use them during development.

**Systems**:  
To migrate applications on to a server a few steps need to be taken. To create a test or prod server, follow the steps below:

1. On the puppet master, run the create-node script in the [/puppet-scripts](https://gitlab.fso.arizona.edu/Systems/puppet-scripts) directory.
2. Create DNS/DHCP reservations.
3. SSH in to the new server and create a directory at `/var/www/specialhandling` with write privileges for the `developers` group. Running a pipeline within Gitlab will then sync the project on to the server.
4. Run the production script in `/var/www/specialhandling/setup/scripts`.  
5. Configure the environment variables in `/etc/apache2/envars` for `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DJANGO_ADMIN_URL`, `DJANGO_SECRET_KEY`, `SENTRY_DSN`, and any API keys that may be in use. Create a corresponding database in the [puppet postgresql manifest](https://gitlab.fso.arizona.edu/Systems/puppet/blob/develop/code/environments/production/manifests/nodes/postgresql.pp).  
  <sup>*The database setup will need to be pushed/pulled on to the puppet master, to speed things up you may want to ssh in to the postgresql server and run the puppet agent, `puppet agent -t` to have the database created instead of waiting up to the 30 minute interval before the next puppet agent run.</sup>
6. Get an SSL certificate from [InCommon](https://cert-manager.com/customer/InCommon?locale=en#0). The csr already exists in `/etc/ssl/certs`.  
7. Install the [django-uashib pip package](https://gitlab.fso.arizona.edu/FAST/django-uashib) in to the virtual environment. You will also need to replace content of `/etc/shibboleth/shibboleth2.xml` with the shibboleth2/shibboleth2-netidplus XML file (based on application need for NETID+) as well as the `attribute-map` and `attribute-policy` XML files which are all in the django-uashib repository. You will also need to copy `UA-IdP.pem` in to `/etc/shibboleth`. Then [enroll the application with UITS](https://siaapps.uits.arizona.edu/home/?tab=shibbolethtab), the cert UITS needs is `/etc/shibboleth/sp-cert.pem`.  
  <sup>*If you have trouble installing the pip package make sure the permissions on the virtual environment folder belong to www-data:developer and the group has write permissions. All of the files in `/etc/shibboleth` should be owned by root.</sup>
8. Add the server to the appropriate Veeam backup and replication jobs.

If everything is in working order you should be able to restart the server and have the application start automatically. CI/CD should be able to deploy any changes to the project as well.
