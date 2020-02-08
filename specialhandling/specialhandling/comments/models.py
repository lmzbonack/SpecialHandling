"""Comments Endpoint Models"""

from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from model_utils.models import TimeStampedModel


def deleted_user():
    """Replace a deleted users relationship with a fake one"""
    return get_user_model().objects.get_or_create(username='deleted')[0]


class Comment(TimeStampedModel):

    """Comment Fields"""

    user = models.ForeignKey(User,
                             on_delete=models.SET(deleted_user))
    related_check = models.ForeignKey('checks.Check',
                                      on_delete=models.CASCADE,
                                      related_name="comments")
    comment = models.CharField(max_length=120, blank=False)

    def __str__(self):
        """String representation"""
        return self.comment
