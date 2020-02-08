"""Comments endpoint model functionality tests"""

from django.test import TestCase
from django.contrib.auth.models import User

from specialhandling.comments.models import Comment, deleted_user
from specialhandling.checks.models import Check


class TestComment(TestCase):

    """Model Tests"""

    def setUp(self):
        self.test_user = User.objects.create_user(
            'ragnarlothbrok', 'ragnar@viking.com', 'boats'
        )
        self.client.login(username='ragnarlothbrok', password='boats')

        self.test_check = Check.objects.create(
            payee_name='Han Solo',
            payee_number='1948573-09',
            edoc_number='123456',
            org_code='124',
            instructions='do a thing',
            check_number='1456789',
            contact_name='Murtle',
            contact_number='000-0000',
            contact_email='murtleTurtle@arizona.email.edu',
            contacted=True,
            picked_up=True,
            user=self.test_user
        )
        self.test_comment = Comment.objects.create(
            user=self.test_user,
            related_check=self.test_check,
            comment="This check bounced you looney!"
        )

    def test_comment_field(self):
        """Comment field tests"""
        comment = Comment.objects.get(related_check=self.test_check.id)
        max_length = comment._meta.get_field('comment').max_length
        self.assertEqual(max_length, 120)

    def test__str__(self):
        """Test the string representation"""
        self.assertEqual(self.test_comment.__str__(), 'This check bounced you looney!')

    def test_save(self):
        """Test the values are correct on creation"""
        self.assertTrue(isinstance(self.test_comment, Comment))
        self.assertEqual(self.test_comment.user.username, 'ragnarlothbrok')
        self.assertEqual(self.test_comment.related_check, self.test_check)
        self.assertEqual(self.test_comment.comment, 'This check bounced you looney!')

    def test_deleted_user_retrieval(self):
        """Test the fake user replacement method"""
        temp_user = deleted_user()
        self.assertEqual(temp_user.username, 'deleted')

    def test_deleted_user_applied(self):
        """Test that a fake user is applied to models when the original user is deleted"""
        # Delete the user
        user = User.objects.get(username='ragnarlothbrok')
        user.delete()
        # Check that the comment was updated
        comment = Comment.objects.get(related_check=self.test_check.id)
        self.assertEqual(comment.user.username, 'deleted')
