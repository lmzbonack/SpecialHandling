"""Signatures app urls"""
from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter

from specialhandling.signatures import views


router = DefaultRouter()
# router.register(r'', views.<ViewSet>, base_name='signatures')
router.register(r'', views.SignatureViewSet, base_name='signatures')

urlpatterns = [
    url(r'^', include(router.urls)),
]
