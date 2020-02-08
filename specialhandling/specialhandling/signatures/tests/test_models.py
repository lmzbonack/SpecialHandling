"""Model Tests for Signature"""
from django.test import TestCase
from django.contrib.auth.models import User

from specialhandling.checks.models import Check
from specialhandling.signatures.models import Signature, deleted_user


class TestSignature(TestCase):

    """Test Signature model"""

    def setUp(self):
        self.test_user = User.objects.create_user(
            'jim', 'raynor@sc2.com', 'kerrigan'
        )

        self.test_check = Check.objects.create(
            payee_name='Margret',
            payee_number='1948573-09',
            edoc_number='21324',
            org_code='124',
            instructions='UPS',
            check_number='1456789',
            contact_name='Luc Zbonack',
            contact_number='621-9000',
            contact_email='lzm@email.arizona.edu',
            contacted=True,
            picked_up=True,
            user=self.test_user
        )

        self.test_signature = Signature.objects.create(
            first_name="Luc",
            last_name="Zbonack",
            signature="Luc Zbonack",
            related_check=self.test_check,
            user=self.test_user
        )

    def test_first_name_field(self):
        """Test first_name field"""
        first_name = Signature.objects.get(first_name='Luc')
        max_length = first_name._meta.get_field('first_name').max_length
        self.assertEqual(max_length, 40)

    def test_last_name_field(self):
        """Test last_name field"""
        last_name = Signature.objects.get(last_name='Zbonack')
        max_length = last_name._meta.get_field('last_name').max_length
        self.assertEqual(max_length, 40)

    def test_related_check_field(self):
        """Test related check field"""
        sig = Signature.objects.get(related_check=self.test_check)
        self.assertIsInstance(sig.related_check, Check)

    def test__str__(self):
        """Test the string representation"""
        string = '%d - Zbonack, Luc' % (self.test_signature.id)
        self.assertEqual(self.test_signature.__str__(), string)

    def test_save(self):
        """Test model save"""
        self.assertEqual(self.test_signature.user.username, 'jim')
        self.assertEqual(self.test_signature.first_name, 'Luc')
        self.assertEqual(self.test_signature.last_name, 'Zbonack')
        self.assertEqual(self.test_signature.signature, 'Luc Zbonack')

    def test_deleted_user_retrieval(self):
        """Test the fake user replacement method"""
        temp_user = deleted_user()
        self.assertEqual(temp_user.username, 'deleted')

    def test_deleted_user_applied(self):
        """Test that a fake user is applied to models when the original user is deleted"""
        # Delete the user
        user = User.objects.get(username='jim')
        user.delete()
        # Check that the signature was updated
        signature = Signature.objects.get(first_name=self.test_signature.first_name)
        self.assertEqual(signature.user.username, 'deleted')
