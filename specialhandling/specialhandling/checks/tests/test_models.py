"""Check endpoint model tests"""
import datetime
from django.test import TestCase
from django.contrib.auth.models import User

from specialhandling.checks.models import Check, ArchivedSignature, deleted_user

from specialhandling.signatures.models import Signature


class CheckModelTests(TestCase):

    """Check Model Tests"""

    def setUp(self):
        self.test_user = User.objects.create_user(
            'bernard', 'bernard@email.com', 'password'
        )

        self.check = Check.objects.create(
            payee_name='Jeff',
            payee_number='1948573-09',
            check_identifier='accounts payable',
            edoc_number=1234563,
            org_code='1243',
            instructions='courier delivery',
            check_number='1456789',
            contact_name='Murtle',
            contact_number='000-0000',
            contact_email='murtleTurtle@email.arizona.edu',
            contacted=True,
            picked_up=True,
            user=self.test_user,
            due_date=datetime.date.today()
        )

    def test_payee_name_field(self):
        """Payee_name field tests"""
        field = Check.objects.get(payee_name='Jeff')
        max_length = field._meta.get_field('payee_name').max_length
        self.assertEqual(max_length, 40)

    def test_payee_number_field(self):
        """Payee_number field tests"""
        field = Check.objects.get(payee_name='Jeff')
        max_length = field._meta.get_field('payee_number').max_length
        self.assertEqual(max_length, 10)

    def test_edoc_number_field(self):
        """edoc_number field tests"""
        # We just test the verbose name since there isn't anything else to check
        field = Check.objects.get(payee_name='Jeff')
        verbose_name = field._meta.get_field('edoc_number').verbose_name
        self.assertEqual(verbose_name, 'edoc number')

    def test_org_code_field(self):
        """org_code field tests"""
        field = Check.objects.get(payee_name='Jeff')
        max_length = field._meta.get_field('org_code').max_length
        self.assertEqual(max_length, 4)

    def test_instructions_field(self):
        """org_number field tests"""
        field = Check.objects.get(payee_name='Jeff')
        max_length = field._meta.get_field('instructions').max_length
        self.assertEqual(max_length, 90)

    def test_check_identifier_field(self):
        """check_identifier filed tests"""
        field = Check.objects.get(payee_name='Jeff')
        max_length = field._meta.get_field('check_identifier').max_length
        self.assertEqual(max_length, 90)

    def test_check_number_field(self):
        """check_number field tests"""
        field = Check.objects.get(payee_name='Jeff')
        max_length = field._meta.get_field('check_number').max_length
        self.assertEqual(max_length, 9)

    def test_contact_name_field(self):
        """org_number field tests"""
        field = Check.objects.get(payee_name='Jeff')
        max_length = field._meta.get_field('contact_name').max_length
        self.assertEqual(max_length, 40)

    def test_contact_number_field(self):
        """contact_number field tests"""
        field = Check.objects.get(payee_name='Jeff')
        max_length = field._meta.get_field('contact_number').max_length
        self.assertEqual(max_length, 20)

    def test_contact_email_field(self):
        """contact_email field tests"""
        field = Check.objects.get(payee_name='Jeff')
        max_length = field._meta.get_field('contact_email').max_length
        self.assertEqual(max_length, 255)

    def test_save(self):
        """Test the values are correct on creation"""
        self.assertTrue(isinstance(self.check, Check))
        self.assertEqual(self.check.user.username, 'bernard')
        self.assertEqual(self.check.payee_name, 'Jeff')
        self.assertEqual(self.check.payee_number, '1948573-09')
        self.assertEqual(self.check.check_identifier, "accounts payable")
        self.assertEqual(self.check.edoc_number, 1234563)
        self.assertEqual(self.check.org_code, '1243')
        self.assertEqual(self.check.instructions, 'courier delivery')
        self.assertEqual(self.check.check_number, '1456789')
        self.assertEqual(self.check.contact_name, 'Murtle')
        self.assertEqual(self.check.contact_number, '000-0000')
        self.assertEqual(self.check.contact_email, 'murtleTurtle@email.arizona.edu')
        self.assertEqual(self.check.contacted, True)
        self.assertEqual(self.check.picked_up, True)
        self.assertEqual(self.check.due_date, datetime.date.today())

    def test__str__(self):
        """Test the string representation of the check number"""
        self.assertEqual(self.check.__str__(), 'Jeff - 1456789 - accounts payable')

    def test_deleted_user_retrieval(self):
        """Test the fake user replacement method"""
        temp_user = deleted_user()
        self.assertEqual(temp_user.username, 'deleted')

    def test_deleted_user_applied(self):
        """Test that a fake user is applied to models when the original user is deleted"""
        # Delete the user
        user = User.objects.get(username='bernard')
        user.delete()
        # Check that the check was updated
        check = Check.objects.get(check_number=self.check.check_number)
        self.assertEqual(check.user.username, 'deleted')

class ArchivedSignatureModelTests(TestCase):

    """Archived Signature Model Tests"""

    def setUp(self):
        self.test_user = User.objects.create_user(
            'ThunderThor', 'ThunderThor@email.asgard.com', 'password'
        )

        self.test_check = Check.objects.create(
            payee_name='Jeff',
            payee_number='1948573-09',
            check_identifier='accounts payable',
            edoc_number=1234563,
            org_code='1243',
            instructions='courier delivery',
            check_number='1456789',
            contact_name='Murtle',
            contact_number='000-0000',
            contact_email='murtleTurtle@email.arizona.edu',
            contacted=True,
            picked_up=True,
            user=self.test_user,
            due_date=datetime.date.today()
        )

        self.test_archived_signature = ArchivedSignature.objects.create(
            first_name="Luc",
            last_name="Zbonack",
            signature="Luc Zbonack",
            reason="Bugbear Attack",
            related_check=self.test_check,
            user=self.test_user
        )

    def test_first_name_field(self):
        """Test first_name field"""
        first_name = ArchivedSignature.objects.get(first_name='Luc')
        max_length = first_name._meta.get_field('first_name').max_length
        self.assertEqual(max_length, 40)

    def test_last_name_field(self):
        """Test last_name field"""
        last_name = ArchivedSignature.objects.get(last_name='Zbonack')
        max_length = last_name._meta.get_field('last_name').max_length
        self.assertEqual(max_length, 40)

    def test_reason_filed(self):
        """Test reason field"""
        reason = ArchivedSignature.objects.get(reason='Bugbear Attack')
        max_length = reason._meta.get_field('reason').max_length
        self.assertEqual(max_length, 90)

    def test_related_check_field(self):
        """Test related check field"""
        sig = ArchivedSignature.objects.get(related_check=self.test_check)
        self.assertIsInstance(sig.related_check, Check)

    def test__str__(self):
        """Test the string representation"""
        self.assertEqual(self.test_archived_signature.__str__(), 'Luc - Zbonack')

    def test_save(self):
        """Test model save"""
        self.assertEqual(self.test_archived_signature.user.username, 'ThunderThor')
        self.assertEqual(self.test_archived_signature.first_name, 'Luc')
        self.assertEqual(self.test_archived_signature.last_name, 'Zbonack')
        self.assertEqual(self.test_archived_signature.signature, 'Luc Zbonack')

    def test_deleted_user_retrieval(self):
        """Test the fake user replacement method"""
        temp_user = deleted_user()
        self.assertEqual(temp_user.username, 'deleted')

    def test_deleted_user_applied(self):
        """Test that a fake user is applied to models when the original user is deleted"""
        # Delete the user
        user = User.objects.get(username='ThunderThor')
        user.delete()
        # Check that the signature was updated
        signature = ArchivedSignature.objects.get(first_name=self.test_archived_signature.first_name)
        self.assertEqual(signature.user.username, 'deleted')
