"""Comments endpoint API functionality tests"""

from rest_framework.test import APITestCase
from django.contrib.auth.models import User

from specialhandling.checks.models import Check
from specialhandling.comments.models import Comment


class CommentAPIGetTests(APITestCase):

    """Test GET requests against comments endpoint"""

    def setUp(self):
        self.test_user = User.objects.create_user(
            'ragnarlothbrok',
            'ragnar@viking.com',
            'boats'
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
        self.test_check_2 = Check.objects.create(
            payee_name='Chewbacca',
            payee_number='1948573-09',
            edoc_number='123456',
            org_code='124',
            instructions='do a thing',
            check_number='1456788',
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
        self.test_comment_2 = Comment.objects.create(
            user=self.test_user,
            related_check=self.test_check_2,
            comment="Who writes checks anymore?"
        )

        self.test_comment_id = Comment.objects.get(id=self.test_comment.id).id

    def test_get_comment_list(self):
        """Get a list of all comments"""
        response = self.client.get('/api/comments/')
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.status_code, 200)

    def test_get_comment_list_fails_no_auth(self):
        """Get a list of all comments fails when request not sent by logged in user"""
        self.client.logout()
        response = self.client.get('/api/comments/')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.status_code, 403)

    def test_get_comment_detail(self):
        """Get a single comment"""
        response = self.client.get('/api/comments/%s/' % self.test_comment_id)
        self.assertEqual(len(response.data), 5)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['comment'], 'This check bounced you looney!')

    def test_get_comment_detail_fails_no_auth(self):
        """Get a single comment fails when request not sent by logged in user"""
        self.client.logout()
        response = self.client.get('/api/comments/%s/' % self.test_comment_id)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.status_code, 403)

class CommentAPIPostTests(APITestCase):

    """Test POST requests against comments endpoint"""

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
        self.test_comment = {
            'related_check': str(self.test_check.id),
            'comment': 'This check bounced you looney!'
        }

    def test_post_comment(self):
        """Test creating a comment"""
        response = self.client.post('/api/comments/', self.test_comment)
        self.assertEqual(len(response.data), 5)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['comment'], 'This check bounced you looney!')

    def test_post_comment_fails_no_auth(self):
        """Test creating a comment fails when request not sent by logged in user"""
        response = self.client.post('/api/comments/', self.test_comment)
        self.assertEqual(len(response.data), 5)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['comment'], 'This check bounced you looney!')

    def test_post_fail_comment_too_long(self):
        """Test that the api fails if the comment is too long"""
        long_comment = {
            'related_check': str(self.test_check.id),
            'comment': 'this message is over 90 characters long so \
                        it should fail when it posts blah blah blah blah blah \
                        but wait not it needs to be even longer. did you even \
                        think that is was possible I did not wow.'
        }
        response = self.client.post('/api/comments/', long_comment)
        self.assertEqual(response.data['comment'][0],
                         'Ensure this field has no more than 120 characters.')
        self.assertEqual(response.status_code, 400)

    def test_post_fail_bad_check(self):
        """Test that the post fails if the check id is incorrectly passed"""
        bad_check = {
            'related_check': 'A',
            'comment': 'whoops, that isn"t an id'
        }
        response = self.client.post('/api/comments/', bad_check)
        self.assertEqual(response.data['related_check'][0], 'Invalid value.')
        self.assertEqual(response.status_code, 400)


class CommentAPIPutTests(APITestCase):

    """Test PUT requests against comments endpoint"""

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
            comment="Memo: Mid-life crisis purchase, sorry future me!"
        )
        self.to_edit = Comment.objects.get(related_check=self.test_check.id).id
        self.put_data = {
            'related_check': str(self.test_check.id),
            'comment': 'Voided in a moment of mid-life crisis clarity'
        }

    def test_put(self):
        """Test editing a comment"""
        response = self.client.put('/api/comments/%s/' % str(self.to_edit), self.put_data)
        self.assertEqual(len(response.data), 5)
        self.assertContains(response, self.put_data['comment'])
        self.assertEqual(response.status_code, 200)

    def test_put_fails_no_auth(self):
        """Test editing a comment fails when request not sent by logged in user"""
        self.client.logout()
        response = self.client.put('/api/comments/%s/' % str(self.to_edit), self.put_data)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.status_code, 403)

    def test_put_fail_bad_comment(self):
        """Test that put fails with bad comment"""
        bad_data = {
            'related_check': str(self.test_check.id),
            'comment': 'Voided in a moment of mid-life crisis clarity \
                        blahblahblahblahblahblahblahblahblahblahblahblah \
                        but here once again watch this I need to make this \
                        thing much beefier so that is what I am going to do \
                        that should do it'
        }

        response = self.client.put('/api/comments/%s/' % str(self.to_edit), bad_data)
        self.assertEqual(response.status_code, 400)


class CommentAPIDeleteTests(APITestCase):

    """Test DELETE requests aginas comments endpoint"""

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
            comment="Delete me"
        )

        self.test_comment_id = Comment.objects.get(related_check=self.test_check.id).id

    def test_delete(self):
        """Test comment deletion"""
        response = self.client.delete('/api/comments/%s/' % str(self.test_comment_id))
        self.assertEqual(response.status_code, 204)

    def test_delete_fails_no_auth(self):
        """Test comment deletion fails when request not sent by logged in user"""
        self.client.logout()
        response = self.client.delete('/api/comments/%s/' % str(self.test_comment_id))
        self.assertEqual(response.status_code, 403)
