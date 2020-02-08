specialhandling
==============================
[![build status](https://gitlab.fso.arizona.edu/FAST/specialhandling/badges/master/build.svg)](https://gitlab.fso.arizona.edu/FAST/specialhandling/commits/master)
[![coverage report](https://gitlab.fso.arizona.edu/FAST/specialhandling/badges/master/coverage.svg)](https://gitlab.fso.arizona.edu/FAST/specialhandling/commits/master)

specialhandling - {{ description }}

### Settings
The following table lists settings and their defaults all applications, which may or may not be part of your project:

| Environment Variable | Django Setting | Local Default | Production Default |
| -------------------- | :------------: | :-----------------: | :----------------: |
| DJANGO_ADMIN_URL | n/a | r’\^admin/’ | raises error |
| DJANGO_DATABASES_DEFAULT | DATABASES (default) | See code | See code |
| DJANGO_DEBUG | DEBUG | True | False |
| DJANGO_SECRET_KEY | SECRET_KEY | CHANGEME!!! | raises error |
| DJANGO_ALLOWED_HOSTS | ALLOWED_HOSTS | See code | ['specialhandling.fso.arizona.edu']
| DJANGO_EMAIL_BACKEND | EMAIL_BACKEND | See code | "smtpgate.email.arizona.edu" |
| DJANGO_SENTRY_DSN | SENTRY_DSN | n/a | raises error |

### Management Commands
* The following management commands are available:
```
$ python manage.py <management_command>
```

### Setting Up Your Users
* To migrate the **models**, use this command:
```
$ python manage.py makemigrations
$ python manage.py migrate
```
* To create an **superuser account**, use this command:
```
$ python manage.py createsuperuser
```

After you are logged into the Django admin, move your Users to the a specified group if necessary. For convenience, you can keep your normal user logged in on Chrome and your superuser logged in on Firefox (or similar), so that you can see how the site behaves for both kinds of users.

#### Keepers of the Archive of Kuali
Special handling includes the ability for a few select users to archive a signature if a mistake was made. This process logs the data in an auditable fashion, but to be able to do it, a user must be in the group `keepers_of_the_archive_of_kuali`. This group should exist in django admin for develop and production server instances, but if there is a new deployment it will need to be created and have users added to it.

To enable this fucntionality, you will need to create the group and populate it.

```bash
$ python manage.py create_archiving_group
$ python manage.py populate_archiving_group --usernames user@arizona.edu,user2@arizona.edu
```

### Test coverage
* To run the tests, check your test coverage, and generate an HTML coverage report:
```
$ coverage run manage.py test
$ coverage html
$ open htmlcov/index.html
```

* Running tests with py.test
```
$ python manage.py test specialhandling.<app_name> --settings=config.settings.test
```
## Vue (Frontend)

The front-end of this application is built using Vue.js, provisioned with `fso-vue-template` on {{ provision_date }}. Check back often with `fso-vue-template` to see what has changed since this frontend was provisioned.

To get started, be sure to install all npm packages:
```shell
$ npm install
```

To run the development server:
```shell
$ npm run dev
```

This will start wepback, which will hot-reload as you make changes. Be sure to leave this running while developing to take advantage of this.

The app also includes linting with `eslint`, and unit tests with `jest` and `vue-test-utils`.

### Additional commands

The following additional commands can be executed:

- `npm run build`: build webpack for production

- `npm run clear-static`: clear the webpack output folder

- `npm run nom`: uninstall and reinstall your node packages

- `npm run lint`: lint files with eslint

- `npm run lint:html`: lint files with eslint and output results to an html file (`eslintlog.html`)

- `npm run test`: run all frontend tests

- `npm run unit`: run unit tests

- `npm run unit:coverage`:  run unit tests with coverage

- `npm run unit:watch`:  run unit tests in watch mode

- `npm run e2e`: run end-to-end (integration) tests

### What Javascript can I use?

All of our frontend code is compiled through webpack and run through `babel.js`. We are able to use anything that is released as part of an ecmascript ratification (i.e. `es2015` through `es2017`), as well as anything that is a `stage-3` or `stage-4` proposal, making it stable to use. For more information, check out [Babel's documentation](https://babeljs.io/docs/plugins/). If the app requires any `stage-2` features, please consult with the team prior to adding it to the babel configuration, as `stage-2` implementations may require future tweaking.

### Testing the Frontend

The `app/tests/` directory contains all of our integration (e2e) and unit testing.

To run all tests, use:
```shell
npm run test
```

**Note:** Integration tests require that the project has been built with `npm run dev` at least once, preferably before running this command, and that the django server is running.

#### Unit Testing

Unit testing is done with Jest/vue-test-utils and also includes snapshot testing.

We've provided folders, as well as a `__mocks__` directory with a file mock and a style mock (you can read about how to use these [here](https://facebook.github.io/jest/docs/en/webpack.html) and about mocks in general [here](https://facebook.github.io/jest/docs/en/manual-mocks.html)). Additionally, there is a `__utils__` directory that includes a babel helper that is needed by jest. Don't delete it. Other mocks and setup files can be added to these folders as appropriate for the application.

`testSetup.js` handle's the basic setup required, such as `jQuery` and the aforementioned babel helper. If you don't use jQuery, feel free to remove that part of the file.

Generally, if you test a file, you'll want to use the same file structure here in this folder, so in most apps there will be `pages` and `components` folders.

Remember that unit testing is all about checking the internal functionality of a Vue.js component... NOT for testing cross-component functionality.

To run unit tests:
```shell
npm run unit
```

To run unit tests with coverage:
```shell
npm run unit:coverage
```

Tests can also be run with a watcher. This way, changes you make to files will be tested live:
```shell
npm run unit:watch
```

#### Integration testing (e2e)

Integration testing is handled by [Nightwatch.js](http://nightwatchjs.org/). To run tests, you need the requisite browsers installed. Currently, tests are only run in Chrome by default. However, if other browsers are added you must have them installed locally. If you run into issues with tests, be sure to update your browsers to the version recommended by the requisite driver (which uses Seleniums WebDriver API to interact with the browser to run the tests), or at a minimum update it to the latest version.

*Warning:* Integration testing is funky. Just because tests aren't passing doesn't mean you are doing something wrong, or because the pass locally but not in CI. This is why we do not run them with the other tests, they are more of a... guideline... than a rule to live by. That doesn't diminish their importance in helping us diagnose issues.

Remember that integration testing is all about testing workflow. This is where cross-component functionality is tested. Essentially, all common user-tasks should have an integration test.

To run tests, use:
```shell
npm run e2e
```

**Caveat:** You need to create a django superuser in order for the integration tests to create info on the api to use for testing. Eventually, this will be automated, however, for now, be sure to run:
```shell
python manage.py createsuperuser --user nightwatch
```
and then give it the email `nightwatch@arizona.edu` and password `password`.

**Note:** Integration tests require that the project has been built with `npm run dev` at least once, preferably before running this command, and that the django server is running.
