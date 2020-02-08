"""
WSGI config for apache.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/
"""
import os
import sys

from django.core.wsgi import get_wsgi_application

# activate virtual environment
activate_this = '/var/www/specialhandling/.virtualenvs/specialhandling/bin/activate_this.py'
exec(open(activate_this).read())  # pylint: disable=exec-used

# in order, the paths we need for this to work
project_pathing = ['/var/www/specialhandling/specialhandling']

for path in project_pathing:
    sys.path.append(path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

# This application object is used by any WSGI server configured to use this
# file. This includes Django's development server, if the WSGI_APPLICATION
# setting points here.
application = get_wsgi_application()
