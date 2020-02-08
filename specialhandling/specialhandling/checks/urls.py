"""Checks endpoint url config"""
from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

router.register(r'archived-signatures', views.ArchivedSignatureViewSet, base_name='archived-signatures')
router.register(r'unsigned-checks', views.UnsignedChecksViewSet, base_name='unsigned-checks')
router.register(r'', views.CheckViewSet, base_name='checks')

urlpatterns = [
    url(r'^', include(router.urls)),
]
