"""Checks endpoint API tests"""
import datetime
import json
from django.urls import reverse
from django.contrib.auth.models import User, Group
from rest_framework.test import APITestCase
from rest_framework import status

from specialhandling.checks.models import Check, ArchivedSignature
from specialhandling.signatures.models import Signature
import specialhandling.checks.constants as constants


class CheckAPIGetTests(APITestCase):

    """Test GET requests against checks endpoint"""

    def setUp(self):
        self.check_url = reverse('checks-list')
        self.test_user = User.objects.create_user(
            'bernard', 'bernard@email.com', 'password'
        )
        self.client.login(username='bernard', password='password')

        self.check = Check.objects.create(
            payee_name='Margret',
            payee_number='29384-18',
            check_identifier='accounts payable',
            edoc_number=2132459,
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

    def test_get(self):
        """Test GET requests"""
        response = self.client.get(self.check_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_fails_no_auth(self):
        """Test GET request fails when not sent by logged in user"""
        self.client.logout()
        response = self.client.get(self.check_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(len(response.data), 1)

class CheckAPIPostTests(APITestCase):

    """Test POST requests against checks endpoint"""

    def setUp(self):
        self.test_user = User.objects.create_superuser(
            'bernard', 'bernard@email.com', 'password'
        )
        self.client.login(username='bernard', password='password')

        self.test_data = {
            'payee_name': 'Sam',
            'payee_number': '42358-12',
            'check_identifier': 'accounts payable',
            'edoc_number': 9999999,
            'org_code': '2323',
            'instructions': 'call for pickup',
            'check_number': '3333345',
            'contact_name': 'Dean',
            'contact_number': '222-222-2222',
            'contact_email': 'dean@email.arizona.edu',
            'contacted': True,
            'picked_up': False
        }

    def test_post(self):
        """Tests creating a check"""
        response = self.client.post('/api/checks/', self.test_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Check each field is stored as expected
        for key in self.test_data:
            self.assertEqual(response.data[key], self.test_data[key])

    def test_post_fails_no_auth(self):
        """Tests creating a check fails when not sent by logged in user"""
        self.client.logout()
        response = self.client.post('/api/checks/', self.test_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(len(response.data), 1)

    def test_post_fail_no_payee_name(self):
        """Test that the api fails if the payee_name is not provided"""
        fail_data = {**self.test_data}
        del fail_data['payee_name']
        response = self.client.post('/api/checks/', fail_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {'payee_name': ['This field is required.']})

    def test_post_fail_no_payee_number(self):
        """Test that the api fails if the payee_number is not provided"""
        fail_data = {**self.test_data}
        del fail_data['payee_number']
        response = self.client.post('/api/checks/', fail_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {'payee_number': ['This field is required.']})

    def test_post_fail_no_org_code(self):
        """Test that the api fails if the org_code is not provided"""
        fail_data = {**self.test_data}
        del fail_data['org_code']
        response = self.client.post('/api/checks/', fail_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {'org_code': ['This field is required.']})

    def test_post_fail_no_instructions(self):
        """Test that the api fails if no instructions are provided"""
        fail_data = {**self.test_data}
        del fail_data['instructions']
        response = self.client.post('/api/checks/', fail_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {'instructions': ['This field is required.']})

    def test_post_validate_check_number(self):
        """Test that the check number validator is functioning properly"""
        fail_data = {**self.test_data}
        fail_data['check_number'] = '58372a'
        response = self.client.post('/api/checks/', fail_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {'check_number': [constants.CHECK_NUM_MESSAGE]})

    def test_post_validate_phone_number(self):
        """Test that the phone number validator is functioning properly"""
        fail_data = {**self.test_data}
        fail_data['contact_number'] = '0'
        response = self.client.post('/api/checks/', fail_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {'contact_number': [str(constants.PHONE_MESSAGE)]})

    def test_post_validate_org_number(self):
        """Test that the check number validator is functioning properly"""
        fail_data = {**self.test_data}
        fail_data['org_code'] = '0'
        response = self.client.post('/api/checks/', fail_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {'org_code': [constants.ORG_MESSAGE]})

    def test_post_validate_payee_number(self):
        """Test that the payee number validator is functioning properly"""
        fail_data = {**self.test_data}
        fail_data['payee_number'] = '12347-4a'
        response = self.client.post('/api/checks/', fail_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {'payee_number': [constants.PAYEE_NUM_MESSAGE]})

    def test_post_validate_edoc_number(self):
        """Test that the edoc number validator is functioning properly"""
        # Test lower bound
        fail_data = {**self.test_data}
        fail_data['edoc_number'] = 0000
        response = self.client.post('/api/checks/', fail_data)
        self.assertContains(response, 'Please enter a valid 7 or 8 digit number', status_code=400)

        # Test upper bound
        fail_data['edoc_number'] = 999999999
        response2 = self.client.post('/api/checks/', fail_data)
        self.assertContains(response2, 'Please enter a valid 7 or 8 digit number', status_code=400)

    def test_post_validate_email(self):
        """Test that the email validator is functioning properly"""
        fail_data = {**self.test_data}
        fail_data['contact_email'] = 'blah'
        response = self.client.post('/api/checks/', fail_data)
        self.assertContains(response, 'Enter a valid email address.', status_code=400)

    def test_post_validate_idedoc_combo(self):
        """Test that the custom validator for edoc number and check_identifier is working"""
        # Test Mismatch for accounts payable
        fail_data = {**self.test_data}
        # Django converts "" to None but does not let you pass in none directly
        fail_data['edoc_number'] = ""
        response = self.client.post('/api/checks/', fail_data)
        self.assertContains(response, 'defined for Accounts Payable', status_code=400)

        # Test Mismatch for payroll
        fail_data['check_identifier'] = "payroll"
        fail_data['edoc_number'] = 1122334
        response = self.client.post('/api/checks/', fail_data)
        self.assertContains(response, 'Edoc Number must be null for Payroll', status_code=400)

    def test_post_success_payroll(self):
        """Test successful POST for Payroll and edoc_number match"""
        fail_data = {**self.test_data}
        fail_data['check_identifier'] = "payroll"
        # Django converts "" to None but does not let you pass in none directly
        fail_data['edoc_number'] = ""
        response = self.client.post('/api/checks/', fail_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class CheckAPIPutTests(APITestCase):

    """Test PUT requests against checks endpoint"""

    def setUp(self):
        self.test_user = User.objects.create_superuser(
            'bernard', 'bernard@email.com', 'password'
        )
        self.client.login(username='bernard', password='password')

        self.test_check = Check.objects.create(
            payee_name='Smith',
            payee_number='29384-18',
            check_identifier='accounts payable',
            edoc_number=2132459,
            org_code='1245',
            instructions='call for pickup',
            check_number='1456789',
            contact_name='Jeff',
            contact_number='000-0000',
            contact_email='jeff@email.arizona.edu',
            contacted=True,
            picked_up=False,
            user=self.test_user,
            due_date=datetime.date.today()
        )
        self.to_edit = Check.objects.get(payee_name="Smith")

        self.put_data = {
            'payee_name': 'Smith',
            'payee_number': '29384-18',
            'check_identifier': 'accounts payable',
            'edoc_number': 2132459,
            'org_code': '2323',
            'instructions': 'fedex',
            'check_number': '1456789',
            'contact_name': 'Dean',
            'contact_number': '222-222-2222',
            'contact_email': 'dean@email.arizona.edu',
            'contacted': True,
            'picked_up': True,
            'due_date': datetime.date.today()
        }

    def test_put(self):
        """Test editing check"""
        response = self.client.put('/api/checks/%s/' % str(self.to_edit.id), self.put_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_fails_no_auth(self):
        """Test editing check fails when request not sent by logged in user"""
        self.client.logout()
        response = self.client.put('/api/checks/%s/' % str(self.to_edit.id), self.put_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class CheckAPIDeleteTests(APITestCase):

    """Test DELETE requests against checks endpoint"""

    def setUp(self):
        self.test_user = User.objects.create_superuser(
            'bernard', 'bernard@email.com', 'password'
        )
        self.client.login(username='bernard', password='password')

        self.test_check = Check.objects.create(
            payee_name='Smith',
            payee_number='29384-18',
            edoc_number=2132459,
            org_code='1245',
            instructions='',
            check_number='1456789',
            contact_name='Jeff',
            contact_number='000-0000',
            contact_email='jeff@email.arizona.edu',
            contacted=True,
            picked_up=False,
            user=self.test_user,
            due_date=datetime.date.today()
        )
        self.test_check_id = Check.objects.get(payee_name="Smith").id

    def test_delete(self):
        """Test check deletion"""
        response = self.client.delete('/api/checks/%s/' % str(self.test_check_id))
        self.assertEqual(response.status_code, 204)

    def test_delete_fails_no_auth(self):
        """Test check deletion fails when request not sent by logged in user"""
        self.client.logout()
        response = self.client.delete('/api/checks/%s/' % str(self.test_check_id))
        self.assertEqual(response.status_code, 403)

class CheckAPIBatchDeleteTests(APITestCase):

    """Tests batch delete request against checks endpoint"""

    def setUp(self):
        self.test_user = User.objects.create_superuser(
            'bernard', 'bernard@email.com', 'password'
        )
        self.client.login(username='bernard', password='password')

        self.test_check = Check.objects.create(
            payee_name='Smith',
            payee_number='29384-18',
            edoc_number=2132459,
            org_code='1245',
            instructions='',
            check_number='1456789',
            contact_name='Jeff',
            contact_number='000-0000',
            contact_email='jeff@email.arizona.edu',
            contacted=True,
            picked_up=False,
            user=self.test_user,
            due_date=datetime.date.today()
        )

        self.test_check_two = Check.objects.create(
            payee_name='Margaret',
            payee_number='29384-18',
            edoc_number=2132459,
            org_code='1235',
            instructions='',
            check_number='2456789',
            contact_name='Jeff',
            contact_number='000-0000',
            contact_email='jeff@email.arizona.edu',
            contacted=True,
            picked_up=False,
            user=self.test_user,
            due_date=datetime.date.today()
        )

        self.test_check_id = Check.objects.get(payee_name="Smith").id

        self.test_check_id_two = Check.objects.get(payee_name="Margaret").id

    def test_batch_delete_success(self):
        """Test successful batch check deletion"""
        response = self.client.post('/api/checks/delete-checks/?delete={0},{1}'
                                    .format(str(self.test_check_id), str(self.test_check_id_two)))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_batch_delete_fails_no_auth(self):
        """Test batch check deletion fails when not sent by logged in user"""
        self.client.logout()
        response = self.client.post('/api/checks/delete-checks/?delete={0},{1}'
                                    .format(str(self.test_check_id), str(self.test_check_id_two)))
        self.assertEqual(response.status_code, 403)

    def test_batch_delete_failure(self):
        """Test unsuccessful batch check deletion"""
        response = self.client.post('/api/checks/delete-checks/?delete={0},{1}'
                                    .format(str(self.test_check_id), str(self.test_check_id+2)))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_batch_delete_invalid(self):
        """Test invalid batch check deletion"""
        response = self.client.post('/api/checks/delete-checks/?delete=')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CheckAPIBatchUpdateTests(APITestCase):

    """Tests batch update request against checks endpoint"""

    def setUp(self):
        self.test_user = User.objects.create_superuser(
            'bernard', 'bernard@email.com', 'password'
        )
        self.client.login(username='bernard', password='password')

        self.test_check = Check.objects.create(
            payee_name='Smith',
            payee_number='29384-18',
            edoc_number=2132459,
            org_code='1245',
            instructions='',
            check_number='1456789',
            contact_name='Jeff',
            contact_number='000-0000',
            contact_email='jeff@email.arizona.edu',
            contacted=True,
            picked_up=False,
            user=self.test_user,
            due_date=datetime.date.today()    
        )

        self.test_check_two = Check.objects.create(
            payee_name='Margaret',
            payee_number='29384-18',
            edoc_number=2132459,
            org_code='1235',
            instructions='',
            check_number='2456789',
            contact_name='Jeff',
            contact_number='000-0000',
            contact_email='jeff@email.arizona.edu',
            contacted=True,
            picked_up=False,
            user=self.test_user,
            due_date=datetime.date.today()    
        )

        self.test_check_id = Check.objects.get(payee_name="Smith").id

        self.test_check_id_two = Check.objects.get(payee_name="Margaret").id

        self.test_data_success_one = {
            'to_modify': str(self.test_check_id) + ', ' + str(self.test_check_id_two),
            'contacted': True,
        }

        self.test_data_success_two = {
            'to_modify': str(self.test_check_id) + ', ' + str(self.test_check_id_two),
            'contacted': True,
            'instructions': 'fedex'
        }

        self.test_data_fail_one = {
            'to_modify': str(self.test_check_id) + ',500',
            'contacted': True
        }

        self.test_data_fail_two = {
            'to_modify': str(self.test_check_id) + ', ' + str(self.test_check_id_two),
            'contacted': True,
            'instructions': 'Tom Bombadil'
        }

        self.test_data_fail_three = {
            'to_modify': '',
            'contacted': True
        }

    def test_batch_update_fails_no_auth(self):
        """Test batch check updating fails when not sent by logged in user"""
        self.client.logout()
        response = self.client.patch('/api/checks/update-multiple/', self.test_data_success_one)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_successful_contacted_patch(self):
        """Tests updating contacted value"""
        response = self.client.patch('/api/checks/update-multiple/', self.test_data_success_one)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_successful_complete_patch(self):
        """Tests uodating the contacted and instructions value"""
        response = self.client.patch('/api/checks/update-multiple/', self.test_data_success_two)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fail_no_id(self):
        """Tests that request fails when no ids are entered at all"""
        response = self.client.patch('/api/checks/update-multiple/', self.test_data_fail_three)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_fail_patch_bad_id(self):
        """Tests that request fails when one valid id and one invalid id is provided"""
        response = self.client.patch('/api/checks/update-multiple/', self.test_data_fail_one)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_fail_patch_bad_instruct(self):
        """Tests that request fails when instructions provided is not valid"""
        response = self.client.patch('/api/checks/update-multiple/', self.test_data_fail_two)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class CheckAPIPickedUpUpdateTests(APITestCase):
    def setUp(self):
        self.superuser = User.objects.create_superuser(
            'jim', 'raynor@sc2.com', 'kerrigan'
        )
        self.client.login(username='jim', password='kerrigan')
        self.test_user = User.objects.create_user(
            'bernard', 'bernard@email.com', 'password'
        )
        self.check = Check.objects.create(
            payee_name='Margret',
            payee_number='29384-18',
            check_identifier='accounts payable',
            edoc_number=2132459,
            org_code='1245',
            instructions='fedex',
            check_number='1456789',
            contact_name='Jeff',
            contact_number='000-0000',
            contact_email='jeff@email.arizona.edu',
            contacted=True,
            picked_up=False,
            user=self.test_user,
            due_date=datetime.date.today()
        )

        self.data = {
            'first_name': 'Luc',
            'last_name': 'Zbonack',
            'signature': 'Luc Zbonack',
            'related_check': self.check.id
        }

    def test_updates_on_signing(self):
        """Test that picked up attribute changes when check is signed"""
        self.assertFalse(self.check.picked_up)
        self.client.post('/api/signatures/', self.data)
        # Fetch updated model instance from database
        self.check = Check.objects.get(check_number=self.check.check_number)
        self.assertTrue(self.check.picked_up)

    def test_updates_signature_deletion(self):
        """Test that picked up attribute changes when related signature is deleted"""
        self.client.post('/api/signatures/', self.data)
        # Fetch updated model instance from database
        self.check = Check.objects.get(check_number=self.check.check_number)
        self.assertTrue(self.check.picked_up)
        signature = Signature.objects.get(related_check=self.check.id)
        signature.delete()
        # Fetch updated model instance from database
        self.check = Check.objects.get(check_number=self.check.check_number)
        self.assertFalse(self.check.picked_up)

class CheckAPIArchiveSignatureTests(APITestCase):
    def setUp(self):
        group_name = 'keepers_of_the_archive_of_kuali'
        self.group = Group(name=group_name)
        self.group.save()
        self.superuser = User.objects.create_superuser(
            'jim', 'raynor@sc2.com', 'kerrigan'
        )

        self.test_user = User.objects.create_user(
            'bernard', 'bernard@email.com', 'password'
        )
        
        self.client.login(username='bernard', password='password')

        self.check = Check.objects.create(
            payee_name='Margret',
            payee_number='29384-18',
            check_identifier='accounts payable',
            edoc_number=2132459,
            org_code='1245',
            instructions='fedex',
            check_number='1456789',
            contact_name='Jeff',
            contact_number='000-0000',
            contact_email='jeff@email.arizona.edu',
            contacted=True,
            picked_up=False,
            user=self.test_user,
            due_date=datetime.date.today()
        )

        self.signed_check = Check.objects.create(
            payee_name='Tony',
            payee_number='29384-18',
            check_identifier='accounts payable',
            edoc_number=2132459,
            org_code='1245',
            instructions='fedex',
            check_number='1122332',
            contact_name='Jeff',
            contact_number='000-0000',
            contact_email='jeff@email.arizona.edu',
            contacted=True,
            picked_up=False,
            user=self.test_user,
            due_date=datetime.date.today()
        )

        self.test_signature = Signature.objects.create(
            first_name="Luc",
            last_name="Zbonack",
            signature="Luc Zbonack",
            related_check=self.signed_check,
            user=self.test_user
        )

        self.test_check_id = Check.objects.get(payee_name="Margret").id
        self.test_signed_check_id = Check.objects.get(payee_name="Tony").id

        self.test_data_fail_one = {
            'check_id': '',
            'reason': ''
        }

        self.test_data_fail_two = {
            'check_id': str(self.test_signed_check_id),
            'reason': ''
        }

        self.test_data_fail_three = {
            'check_id': '',
            'reason': 'A valid reason'
        }

        self.test_data_fail_four = {
            'check_id': str(self.test_check_id),
            'reason': 'A valid reason'
        }

        self.test_data_succeed = {
            'check_id': str(self.test_signed_check_id),
            'reason': 'A valid reason'
        }

    def test_archive_failure_no_check_and_no_reason(self):
        """Test unsuccessful archive attempt no check id or reason is provided"""
        self.test_user.groups.add(self.group)
        response = self.client.patch('/api/checks/archive/', self.test_data_fail_one)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_archive_failure_no_check(self):
        """Test unsuccessful archive attempt no check id is provided"""
        self.test_user.groups.add(self.group)
        response = self.client.patch('/api/checks/archive/', self.test_data_fail_three)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_archive_failure_no_reason(self):
        """Test unsuccessful archive attempt no reason is provided"""
        self.test_user.groups.add(self.group)
        response = self.client.patch('/api/checks/archive/', self.test_data_fail_three)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_archive_failure_unsigned_check(self):
        """Test unsuccessful archive attempt check does not exist"""
        self.test_user.groups.add(self.group)
        response = self.client.patch('/api/checks/archive/', self.test_data_fail_four)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_archive_valid_check(self):
        """Test successful archive attempt on signed check"""
        self.test_user.groups.add(self.group)
        response = self.client.patch('/api/checks/archive/', self.test_data_succeed)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_archive_valid_check_fails_not_in_group(self):
        """Test successful archive attempt on signed check"""
        response = self.client.patch('/api/checks/archive/', self.test_data_succeed)
        self.assertEqual(response.status_code, 403)

    def test_archive_check_fails_no_auth(self):
        """Test archiving fails when not sent by logged in user"""
        self.client.logout()
        response = self.client.patch('/api/checks/archive/', self.test_data_succeed)
        self.assertEqual(response.status_code, 403)

class CheckAPIUserCanArchiveTests(APITestCase):
    def setUp(self):
        group_name = 'keepers_of_the_archive_of_kuali'
        self.group = Group(name=group_name)
        self.group.save()

        self.test_user = User.objects.create_user(
            'bernard', 'bernard@email.com', 'password'
        )
     
        self.client.login(username='bernard', password='password')

    def test_can_archive(self):
        self.test_user.groups.add(self.group)
        response = self.client.get('/api/checks/user-can-archive/')
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            str(response.content, encoding='utf8'),
            {'username': 'bernard', 'canArchive': True}
        )

    def test_cannot_archive(self):
        response = self.client.get('/api/checks/user-can-archive/')
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            str(response.content, encoding='utf8'),
            {'username': 'bernard', 'canArchive': False}
        )

class ArchivedSignatureAPIGetTests(APITestCase):

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

        self.test_archived_signature = ArchivedSignature.objects.create(
            first_name="Luc",
            last_name="Zbonack",
            signature="Luc Zbonack",
            related_check=self.test_check_1,
            user=self.test_user
        )
        self.test_archived_signature_id = ArchivedSignature.objects.get(signature="Luc Zbonack").id
        
        self.test_archived_signature_two = ArchivedSignature.objects.create(
            first_name="Billy",
            last_name="Bob",
            signature="Billy Bob",
            related_check=self.test_check_2,
            user=self.test_user_two
        )

        self.test_archived_signature_two_id = ArchivedSignature.objects.get(signature="Billy Bob").id

    def test_get_archived_signature_list(self):
        """Test GET request for all signatures"""
        response = self.client.get('/api/checks/archived-signatures/')
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.status_code, 200)

    def test_get_archived_signature_list_fails_no_auth(self):
        """Test GET request for all signatures fails when not sent by logged in user"""
        self.client.logout()
        response = self.client.get('/api/checks/archived-signatures/')
        self.assertEqual(response.status_code, 403)

    def test_get_archived_signature_first(self):
        """Test GET request for signature with first id"""
        response = self.client.get('/api/checks/archived-signatures/%s/' % str(self.test_archived_signature_id))
        self.assertEqual(len(response.data), 9)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['signature'], 'Luc Zbonack')

    def test_get_archived_signature_first_fails_no_auth(self):
        """Test GET request for first signature fails when not sent by logged in user"""
        self.client.logout()
        response = self.client.get('/api/checks/archived-signatures/')
        self.assertEqual(response.status_code, 403)

    def test_get_archived_signature_second(self):
        """Test GET request for signature with second id"""
        response = self.client.get('/api/checks/archived-signatures/%s/' % str(self.test_archived_signature_two_id))
        self.assertEqual(len(response.data), 9)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['signature'], 'Billy Bob')
