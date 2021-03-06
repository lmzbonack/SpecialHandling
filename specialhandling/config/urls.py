# -*- coding: utf-8 -*-
"""URL config for myapp project."""
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth.views import logout
from django.views import defaults as default_views

from .views import IndexView

SHIBB_OUT_URL = 'https://specialhandling.fso.arizona.edu/Shibboleth.sso/Logout?return=https://shibboleth.arizona.edu/cgi-bin/logout.pl'

urlpatterns = [
    url(r'^$', IndexView.as_view(template_name='pages/home.html'), name='home'),

    # Django Admin, use {% url 'admin:index' %}
    url(settings.ADMIN_URL, include(admin.site.urls), name='admin'),

    # Logout for Shibboleth
    url(r'^logout/$', logout, {'next_page': SHIBB_OUT_URL}, name='logout'),

    # User management
    # url(r'^users/', include('specialhandling.users.urls'), name='users'), # Example

    # Your stuff: custom urls includes go here
    # url(r'^apples/', include('specialhandling.apples.urls'), name='apples'), # Example
    url(r'^api/checks/', include('specialhandling.checks.urls'), name='checks'),
    url(r'^api/comments/', include('specialhandling.comments.urls'), name='comments'),
    url(r'^api/signatures/', include('specialhandling.signatures.urls'), name='signatures')
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        url(r'^400/$', default_views.bad_request, kwargs={'exception': Exception('Bad Request!')}),
        url(r'^403/$', default_views.permission_denied, kwargs={'exception': Exception('Permission Denied')}),
        url(r'^404/$', default_views.page_not_found, kwargs={'exception': Exception('Page not Found')}),
        url(r'^500/$', default_views.server_error),
    ]
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns += [
            url(r'^__debug__/', include(debug_toolbar.urls)),
        ]
else:
    urlpatterns += [
        #Gatekeeper auth
        url(r'^auth/', include('gatekeeper.urls')),
    ]
