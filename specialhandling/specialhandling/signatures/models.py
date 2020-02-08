"""Signatures app models"""
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from model_utils.models import TimeStampedModel

def deleted_user():
    """Replace a deleted users relationship with a fake one"""
    return get_user_model().objects.get_or_create(username='deleted')[0]


class Signature(TimeStampedModel):
    """Signature model to track who signs for checks"""

    first_name = models.CharField(max_length=40)
    last_name = models.CharField(max_length=40)
    signature = models.TextField()
    related_check = models.OneToOneField('checks.Check',
                                         related_name="signature",
                                         on_delete=models.CASCADE)
    user = models.ForeignKey(User,
                             on_delete=models.SET(deleted_user))


    def save(self, *args, **kwargs):
        """Override save method to set the associated check's picked_up field to true"""
        from specialhandling.checks.models import Check
        # pylint: disable=E1101
        update_check = Check.objects.get(id=self.related_check.id)
        update_check.picked_up = True
        update_check.save()
        super().save(*args, **kwargs)  # Call the "real" save() method.

    def __str__(self):
        return '%d - %s, %s' % (self.id, self.last_name, self.first_name)
