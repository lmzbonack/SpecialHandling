"""Comments endpoint url config"""

from django.conf.urls import url, include

from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'', views.CommentsViewSet, base_name='comments')

urlpatterns = [
    url(r'^', include(router.urls)),
]
