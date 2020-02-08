"""Signatures api tests"""
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

from specialhandling.checks.models import Check
from specialhandling.signatures.models import Signature


class SignatureAPIGetTests(APITestCase):

    """Get tests"""

    def setUp(self):
        self.test_user = User.objects.create_user(
            'jim', 'raynor@sc2.com', 'kerrigan'
        )

        self.test_user_two = User.objects.create_user(
            'sarah', 'kerrrigan@sc2.com', 'raynor'
        )

        self.client.login(username='jim', password='kerrigan')

        self.test_check_1 = Check.objects.create(
            payee_name='Margret',
            payee_number='1948573-09',
            edoc_number='21324',
            org_code='124',
            instructions='ups',
            check_number='1456789',
            contact_name='Luc Zbonack',
            contact_number='621-9000',
            contact_email='lzm@email.arizona.edu',
            contacted=True,
            picked_up=True,
            user=self.test_user
        )

        self.test_check_2 = Check.objects.create(
            payee_name='Stacy\'s Mom',
            payee_number='1948573-09',
            edoc_number='21322',
            org_code='125',
            instructions='ups',
            check_number='1456788',
            contact_name='Billy Bob',
            contact_number='621-9000',
            contact_email='bb@email.arizona.edu',
            contacted=True,
            picked_up=True,
            user=self.test_user
        )

        self.test_signature = Signature.objects.create(
            first_name="Luc",
            last_name="Zbonack",
            signature="Luc Zbonack",
            related_check=self.test_check_1,
            user=self.test_user
        )
        self.test_signature_id = Signature.objects.get(signature="Luc Zbonack").id
        self.test_signature_two = Signature.objects.create(
            first_name="Billy",
            last_name="Bob",
            signature="Billy Bob",
            related_check=self.test_check_2,
            user=self.test_user_two
        )

        self.test_signature_two_id = Signature.objects.get(signature="Billy Bob").id

    def test_get_signature_list(self):
        """Test GET request for all signatures"""
        response = self.client.get('/api/signatures/')
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.status_code, 200)

    def test_get_signature_first(self):
        """Test GET request for signature with first id"""
        response = self.client.get('/api/signatures/%s/' % str(self.test_signature_id))
        self.assertEqual(len(response.data), 8)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['signature'], 'Luc Zbonack')

    def test_get_signature_second(self):
        """Test GET request for signature with second id"""
        response = self.client.get('/api/signatures/%s/' % str(self.test_signature_two_id))
        self.assertEqual(len(response.data), 8)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['signature'], 'Billy Bob')

    def test_get_fails_no_auth(self):
        """Test GET request fails when not sent by logged in user"""
        self.client.logout()
        response = self.client.get('/api/signatures/')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.status_code, 403)

class SignatureAPIPostTests(APITestCase):

    """Creation tests"""

    def setUp(self):
        self.superuser = User.objects.create_superuser(
            'jim', 'raynor@sc2.com', 'kerrigan'
        )
        self.client.login(username='jim', password='kerrigan')

        self.related_check = Check.objects.create(
            payee_name='Margret',
            payee_number='1948573-09',
            edoc_number='21324',
            org_code='124',
            instructions='ups',
            check_number='1456789',
            contact_name='Luc Zbonack',
            contact_number='621-9000',
            contact_email='lzm@email.arizona.edu',
            contacted=True,
            picked_up=True,
            user=self.superuser
        )

        self.data = {
            'first_name': 'Luc',
            'last_name': 'Zbonack',
            'signature': 'Luc Zbonack',
            'related_check': self.related_check.id
        }

        self.long_first_name_data = {
            'first_name': 'Daenerys of the House Targaryen, the First of Her Name, \
                          The Unburnt, Queen of the Andals, the Rhoynar and the First Men, \
                          Queen of Meereen, Khaleesi of the Great Grass Sea, Protector of the \
                          Realm, Lady Regnant of the Seven Kingdoms, Breaker of Chains and \
                          Mother of Dragons',
            'last_name': 'Stormborn',
            'signature': 'Daenerys Stormborn',
            'related_check': self.related_check.id
        }

        self.long_last_name_data = {
            'first_name': 'Luc',
            'last_name': 'SeeTheThingIsThatISpentAllMyEffortAndCreativityOnTheFirstName\
                         TestSoThisLongStringIsGonnaHaveToBeGoodEnough',
            'signature': 'Luc Wrong',
            'related_check': self.related_check.id
        }

        self.no_signature_data = {
            'first_name': 'Forgetful',
            'last_name': 'Lad',
            'signature': '',
            'related_check': self.related_check.id
        }

        self.no_related_check = {
            'first_name': 'Luke',
            'last_name': 'Skywalker',
            'signature': 'dfskdfjlsdf'
        }

    def test_can_post_signature(self):
        """Test that a signature is created properly"""
        response = self.client.post('/api/signatures/', self.data)
        self.assertEqual(len(response.data), 8)
        self.assertEqual(response.status_code, 201)

    def test_first_name_too_long(self):
        """Test that a signature with a long first name fails"""
        response = self.client.post('/api/signatures/', self.long_first_name_data)
        self.assertEqual(response.data,
                         {'first_name': ['Ensure this field has no more than 40 characters.']})
        self.assertEqual(response.status_code, 400)

    def test_last_name_too_long(self):
        """Test that a signature with a long last name fails"""
        response = self.client.post('/api/signatures/', self.long_last_name_data)
        self.assertEqual(response.data,
                         {'last_name': ['Ensure this field has no more than 40 characters.']})
        self.assertEqual(response.status_code, 400)

    def test_no_signature(self):
        """Test that signature is required"""
        response = self.client.post('/api/signatures/', self.no_signature_data)
        self.assertEqual(response.data,
                         {'signature': ['This field may not be blank.']})
        self.assertEqual(response.status_code, 400)

    def test_no_related_check(self):
        """Test that a signature without a related check fails"""
        response = self.client.post('/api/signatures/', self.no_related_check)
        self.assertEqual(response.data,
                         {'related_check': ['This field is required.']})
        self.assertEqual(response.status_code, 400)

    def test_post_signature_fails_no_auth(self):
        """Test that a POST request fails when not sent by a logged in user"""
        self.client.logout()
        response = self.client.post('/api/signatures/', self.data)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.status_code, 403)


class SignatureAPIPutTests(APITestCase):

    """Test edit"""

    def setUp(self):
        self.test_user = User.objects.create_user(
            'jim', 'raynor@sc2.com', 'kerrigan'
        )
        self.client.login(username='jim', password='kerrigan')

        self.related_check = Check.objects.create(
            payee_name='Margret',
            payee_number='1948573-09',
            edoc_number='21324',
            org_code='124',
            instructions='ups',
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
            related_check=self.related_check,
            user=self.test_user
        )
        self.to_edit = Signature.objects.get(signature="Luc Zbonack")

        self.put_data = {
            'first_name': 'Luc',
            'last_name': 'Zbonack',
            'signature': 'Luc Zbonack',
            'related_check': self.related_check.id
        }

        self.long_first_name = {
            'first_name': 'Daenerys of the House Targaryen, the First of Her Name, \
                          The Unburnt, Queen of the Andals, the Rhoynar and the First Men, \
                          Queen of Meereen, Khaleesi of the Great Grass Sea, Protector of the \
                          Realm, Lady Regnant of the Seven Kingdoms, Breaker of Chains and \
                          Mother of Dragons',
            'last_name': 'Stormborn',
            'signature': 'Daenerys Stormborn',
            'related_check': self.related_check.id
        }

        self.long_last_name = {
            'first_name': 'Luc',
            'last_name': 'SeeTheThingIsThatISpentAllMyEffortAndCreativityOnTheFirstName\
                         TestSoThisLongStringIsGonnaHaveToBeGoodEnough',
            'signature': 'Luc Wrong',
            'related_check': self.related_check.id
        }

    def test_put(self):
        """Test editing"""
        response = self.client.put('/api/signatures/%s/' % str(self.to_edit.id), self.put_data)
        self.assertEqual(len(response.data), 8)
        self.assertContains(response, self.put_data['signature'])
        self.assertEqual(response.status_code, 200)

    def test_put_fails_no_auth(self):
        """Test PUT request fails when not sent by a logged in user"""
        self.client.logout()
        response = self.client.put('/api/signatures/%s/' % str(self.to_edit.id), self.put_data)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.status_code, 403)

    def test_put_fail_fname_too_long(self):
        """Test that a long first name fails"""
        response = self.client.put('/api/signatures/%s/' % str(self.to_edit.id),
                                   self.long_first_name)
        self.assertEqual(response.data,
                         {'first_name': ['Ensure this field has no more than 40 characters.']})
        self.assertEqual(response.status_code, 400)

    def test_put_fail_lname_too_long(self):
        """Test that a long last name fails"""
        response = self.client.put('/api/signatures/%s/' % str(self.to_edit.id),
                                   self.long_last_name)
        self.assertEqual(response.data,
                         {'last_name': ['Ensure this field has no more than 40 characters.']})
        self.assertEqual(response.status_code, 400)


class SignatureAPIDeleteTests(APITestCase):

    """Delete tests"""

    def setUp(self):
        self.test_user = User.objects.create_user(
            'jim', 'raynor@sc2.com', 'kerrigan'
        )
        self.client.login(username='jim', password='kerrigan')

        self.related_check = Check.objects.create(
            payee_name='Margret',
            payee_number='1948573-09',
            edoc_number='21324',
            org_code='124',
            instructions='ups',
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
            related_check=self.related_check,
            user=self.test_user
        )

        self.test_signature_id = Signature.objects.get(signature="Luc Zbonack").id

    def test_delete(self):
        """Test that an object can be deleted"""
        response = self.client.delete('/api/signatures/%s/' % str(self.test_signature_id))
        self.assertEqual(response.status_code, 204)

    def test_delete_fails_no_auth(self):
        """Test that a DELETE request fails when not sent by a logged in user"""
        self.client.logout()
        response = self.client.delete('/api/signatures/%s/' % str(self.test_signature_id))
        self.assertEqual(response.status_code, 403)

class SignatureAPICreateMultipleTests(APITestCase):

    """Tests for the multiple signature creation list_route"""

    def setUp(self):
        self.test_user = User.objects.create_user(
            'jim', 'raynor@sc2.com', 'kerrigan'
        )
        self.client.login(username='jim', password='kerrigan')

        self.related_check = Check.objects.create(
            payee_name='Margret Thatcher',
            payee_number='1948573-09',
            edoc_number='2132444',
            org_code='1224',
            instructions='ups',
            check_number='1457895',
            contact_name='Ronald McDonald',
            contact_number='621-9000',
            contact_email='ron@email.arizona.edu',
            contacted=True,
            picked_up=True,
            user=self.test_user
        )

        self.related_check_2 = Check.objects.create(
            payee_name='Winston Churchill',
            payee_number='1948573-09',
            edoc_number='2132444',
            org_code='1244',
            instructions='ups',
            check_number='145789',
            contact_name='Ronald McDonald',
            contact_number='621-9000',
            contact_email='ron@email.arizona.edu',
            contacted=True,
            picked_up=True,
            user=self.test_user
        )

        self.test_signature = {
            'checks': [self.related_check.id, self.related_check_2.id],
            'first_name': "Queen",
            'last_name': "Elizabeth",
            'signature': "IOwnTheWorldSuckers"
        }

        self.url = '/api/signatures/create-multiple/'

    def test_multiple_creation(self):
        """Test that a signature can be created for two checks at once."""
        # print('---payload---')
        # print(self.test_signature['checks'])
        # print('---')
        response = self.client.post(self.url, self.test_signature)
        self.assertEqual(response.status_code, 204)

    def test_multiple_creation_fails_no_auth(self):
        """Test that a signature can be created for two checks at once."""
        self.client.logout()
        response = self.client.post(self.url, self.test_signature)
        self.assertEqual(response.status_code, 403)

    def test_previously_signed(self):
        """Test that previously signed checks will properly error out."""
        self.client.post(self.url, self.test_signature)
        response = self.client.post(self.url, self.test_signature)
        self.assertContains(response, 'related_check', status_code=400)

    def test_no_checks_provided(self):
        """Test that the endpoint errors out properly if no checks are sent."""
        no_checks = {
            'first_name': "Queen",
            'last_name': "Elizabeth",
            'signature': "IOwnTheWorldSuckers"
        }
        response = self.client.post(self.url, no_checks)
        self.assertContains(response, 'checks', status_code=400)

        empty_checks = {
            'checks': [],
            'first_name': "Queen",
            'last_name': "Elizabeth",
            'signature': "IOwnTheWorldSuckers"
        }
        response2 = self.client.post(self.url, empty_checks)
        self.assertContains(response2, 'checks', status_code=400)

    def test_nonexistent_checks(self):
        """Test that the endpoint errors out properly if nonexistent check(s) are  provided."""
        nonexistent_checks = {
            'checks': [300],
            'first_name': "Queen",
            'last_name': "Elizabeth",
            'signature': "IOwnTheWorldSuckers"
        }
        response = self.client.post(self.url, nonexistent_checks)
        self.assertContains(response, 'Invalid', status_code=400)
