"""Models for Check objects"""
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.core.validators import (EmailValidator,
                                    RegexValidator)
from django.core.exceptions import ValidationError
from model_utils.models import TimeStampedModel

from specialhandling.signatures.models import Signature
import specialhandling.checks.constants as constants


def deleted_user():
    """Replace a deleted users relationship with a fake one"""
    return get_user_model().objects.get_or_create(username='deleted')[0]


def validate_edoc(value):
    """Custom validator for edoc number"""
    if value is not None:
        if (value < 1000000 or value > 99999999):
            raise ValidationError(
                "Please enter a valid 7 or 8 digit number."
            )


class Check(TimeStampedModel):

    """Fields for check model"""

    CHOICE_CALL = 'call for pickup'
    CHOICE_COURIER = 'courier delivery'
    CHOICE_FEDEX = 'fedex'
    CHOICE_UPS = 'ups'
    CHOICE_MAIL = 'mail in envelope provided'
    CHOICE_PAYROLL = 'payroll distribution'
    CHOICE_SSN = 'ssn pull'

    INSTRUCTION_CHOICES = (
        (CHOICE_CALL, 'Call for pickup'),
        (CHOICE_COURIER, 'Courier delivery'),
        (CHOICE_FEDEX, 'FedEx'),
        (CHOICE_UPS, 'UPS'),
        (CHOICE_MAIL, 'Mail in envelope provided'),
        (CHOICE_PAYROLL, 'Payroll distribution'),
        (CHOICE_SSN, 'SSN pull')
    )

    ID_CHOICE_PAYROLL = 'payroll'
    ID_CHOICE_AP = 'accounts payable'

    CHECK_ID_CHOICES = (
        (ID_CHOICE_PAYROLL, 'Payroll'),
        (ID_CHOICE_AP, 'Accounts Payable')
    )

    check_number = models.CharField(max_length=9,
                                    blank=True,
                                    null=True,
                                    unique=True,
                                    validators=[RegexValidator(
                                        constants.CHECK_NUM_REGEX,
                                        constants.CHECK_NUM_MESSAGE)])
    check_identifier = models.CharField(max_length=90,
                                        choices=CHECK_ID_CHOICES)
    contact_email = models.EmailField(max_length=255,
                                      validators=[EmailValidator('Invalid Email')],
                                      blank=True)
    contact_name = models.CharField(max_length=40,
                                    blank=True)
    contact_number = models.CharField(max_length=20,
                                      blank=True,
                                      validators=[RegexValidator(
                                          constants.PHONE_REGEX,
                                          constants.PHONE_MESSAGE)])
    contacted = models.BooleanField(default=False,
                                    blank=True)
    edoc_number = models.PositiveIntegerField(blank=True,
                                              null=True,
                                              validators=[validate_edoc])
    instructions = models.CharField(max_length=90,
                                    choices=INSTRUCTION_CHOICES)
    org_code = models.CharField(max_length=4,
                                validators=[RegexValidator(
                                    constants.ORG_REGEX,
                                    constants.ORG_MESSAGE)])
    payee_name = models.CharField(max_length=40)
    payee_number = models.CharField(max_length=10,
                                    validators=[RegexValidator(
                                        constants.PAYEE_NUM_REGEX,
                                        constants.PAYEE_NUM_MESSAGE)])
    picked_up = models.BooleanField(default=False,
                                    blank=True)
    due_date = models.DateField(null=True, blank=True)
    user = models.ForeignKey(User,
                             on_delete=models.SET(deleted_user))

    def save(self, *args, **kwargs):
        # Convert Blank `check_number`s to None
        if not self.check_number:
            self.check_number = None
        
        super().save(*args, **kwargs)

    @receiver(post_delete, sender=Signature)
    def refresh_check(sender, instance, **kwargs):
        # pylint: disable=E0213, W0613, R0201
        """If a signature is deleted the picked_up property for the associated checks is reset"""
        update_check = Check.objects.get(id=instance.related_check.id)
        update_check.picked_up = False
        update_check.save()

    def __str__(self):
        return "%s - %s - %s" % (self.payee_name, self.check_number, self.check_identifier)

class ArchivedSignature(TimeStampedModel):
    """Archived Signature model to track signatures that have been archived"""

    first_name = models.CharField(max_length=40)
    last_name = models.CharField(max_length=40)
    reason = models.CharField(max_length=90)
    signature = models.TextField()
    related_check = models.ForeignKey(Check,
                                      related_name="archived_signatures",
                                      on_delete=models.CASCADE)
    user = models.ForeignKey(User,
                             on_delete=models.SET(deleted_user))

    def __str__(self):
        return "%s - %s" % (self.first_name, self.last_name)
