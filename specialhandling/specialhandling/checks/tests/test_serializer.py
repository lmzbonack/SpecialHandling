"""Check endpoint serializer tests"""
import datetime
from django.test import TestCase
from django.contrib.auth.models import User

from specialhandling.checks.serializers import CheckSerializer
from specialhandling.checks.models import Check, ArchivedSignature
from specialhandling.signatures.models import Signature
from specialhandling.comments.models import Comment


class CheckSerializerTests(TestCase):

    """Test serializer methods and logic."""

    def setUp(self):
        self.test_user = User.objects.create_user(
            'bernard', 'bernard@email.com', 'password'
        )
        self.client.login(username='bernard', password='password')

        self.check = Check.objects.create(
            payee_name='Margret',
            payee_number='29384-18',
            check_identifier='payroll',
            edoc_number=None,
            org_code='1245',
            instructions='fedex',
            check_number='1456789',
            contact_name='Jeff',
            contact_number='000-0000',
            contact_email='jeff@email.arizona.edu',
            contacted=True,
            picked_up=True,
            user=self.test_user,
            due_date=datetime.date.today()
        )

        self.signature = Signature.objects.create(
            first_name='Bilbo',
            last_name='Baggins',
            related_check=self.check,
            signature='this is totally an svg',
            user=self.test_user
        )

        self.archived_signatures = ArchivedSignature.objects.create(
            first_name='Peregrin',
            last_name='Took',
            related_check=self.check,
            signature='next time throw yourself down and rid us of your stupidity',
            user=self.test_user
        )

        self.comment1 = Comment.objects.create(
            comment='He is throwing a party for his 111th birthday!',
            related_check=self.check,
            user=self.test_user
        )

        self.comment2 = Comment.objects.create(
            comment='Aaaaaand he just disappeared into thin air. Meh, keep drinking.',
            related_check=self.check,
            user=self.test_user
        )

        self.serializer = CheckSerializer(instance=self.check)

    def test_eager_loading(self):
        """Test that eager loading is finding related objects"""
        self.assertEqual(len(self.serializer.data['comments']), 2)
        # OrderedDicts are difficult, they need to be cast into lists of tuples, and then
        # we need to access the second element and then the second value of that element
        # for the comment value
        test_comment = list(self.serializer.data['comments'][1].items())
        self.assertEqual(test_comment[1][1], self.comment1.comment)
        self.assertIsNotNone(self.serializer.data['signature'])
        # Sligtly less complicated this time
        test_sig = list(self.serializer.data['signature'].items())
        self.assertEqual(test_sig[1][1], self.signature.first_name)
        self.assertIsNotNone(self.serializer.data['archived_signatures'])
        test_archived_sig = list(self.serializer.data['archived_signatures'][0].items())
        self.assertEqual(test_archived_sig[1][1], self.archived_signatures.first_name)
