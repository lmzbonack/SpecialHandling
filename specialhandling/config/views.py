"""Manage home view access with gatekeeper"""

# pylint: disable=arguments-differ
# pylint: disable=useless-super-delegation
# pylint: disable=import-error

from django.conf import settings
from django.views.generic import TemplateView


class IndexView(TemplateView):

    """Template for the home page."""

    template_name = "pages/home.html"

    if settings.DEBUG:
        def dispatch(self, *args, **kwargs):
            return super(IndexView, self).dispatch(*args, **kwargs)

    else:
        from django.utils.decorators import method_decorator
        from gatekeeper.utils.gate import group_required

        @method_decorator(group_required('app_users'))
        def dispatch(self, *args, **kwargs):
            return super(IndexView, self).dispatch(*args, **kwargs)
