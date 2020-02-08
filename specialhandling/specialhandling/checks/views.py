"""Checks endpoint views"""
from django.http import JsonResponse
from django.contrib.auth.models import Group

from rest_framework import status, viewsets
from rest_framework.mixins import ListModelMixin
from rest_framework.decorators import list_route
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from specialhandling.checks.models import Check, ArchivedSignature
from specialhandling.signatures.models import Signature
from specialhandling.comments.models import Comment
from specialhandling.checks.serializers import CheckSerializer, ArchivedSignatureSerializer


class CheckViewSet(viewsets.ModelViewSet):
    # pylint: disable=too-many-ancestors

    """
    An api endpoint for managing Checks.

    retrieve:
    Return a single Check instance.

    list:
    Return a list of all existing Checks, including their associated
    signatures and comments.

    create:
    Create a new Check instance.

    update:
    Update an existing Check instance.

    delete-checks:
    Delete multiple checks at once

    update-multiple:
    Update the 'instructions', and 'contacted' attributes of several checks at once
    Also add comments to multiple checks at once

    archive:
    Archives the signature on one specific check

    user-can-archive:
    Returns data about the logged in user and if that user can archive checks
    
    """

    serializer_class = CheckSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Check.objects.all()
        # Set up eager loading to avoid N+1 selects
        queryset = self.get_serializer_class().setup_eager_loading(queryset)
        return queryset

    def perform_create(self, serializer):
        """Override create to send current user to serializer"""
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Override update to send current user to serializer"""
        serializer.save(user=self.request.user)

    # pylint: disable=no-self-use
    @list_route(methods=['post'], url_path='delete-checks')
    def batch_check_deletion(self, request):
        """
        Delete multiple checks at once

        List route takes in a comma separated string of check id's that will be deleted
        EG: /api/checks/delete-checks/?delete=34,39
        """
        to_delete = []
        checks_to_be_deleted = request.query_params['delete'].split(',')
        valid = True

        # First check to see if the no parameters are entered at all
        if checks_to_be_deleted[0] == '':
            return Response(
                {'Must enter valid check ids'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Then check the vaidity of each id that is entered
        for check in checks_to_be_deleted:
            target = Check.objects.filter(id=int(check))
            if target:
                to_delete.append(target)
            else:
                valid = False

        # If all of the ids are valid then iterate through the to_delete list and delete
        # all checks that correpond to the valid ids entered
        if valid is True:
            for target in to_delete:
                target.delete()
            return Response(
                {'Checks deleted': 'The checks  with IDs ' +
                                   request.query_params['delete'] +
                                   ' have been deleted'},
                status=status.HTTP_200_OK
            )
        # If any of the ids entered are not valid then do not delete any of the ids entered
        return Response(
            {'Checks not found': 'Some of the checks with IDs ' +
                                 request.query_params['delete'] +
                                 ' do not appear to exist...'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @list_route(methods=['patch'], url_path="update-multiple")
    def batch_check_update(self, request):
        """
        Updates multiple checks at once. Specifically the 'instructions' and 'contacted' attributes

        Can also add comments to multiple checks

        Payload: to_modify - comma separated string of check ids
                 instructions - instructions
                 contacted - boolean value for customer contacted
                 comment - comment
        """
        to_update = []
        checks_to_be_replaced = request.data['to_modify'].split(',')
        valid = True
        change_dict = {}
        valid_instruction_choices = []
        for check in Check.INSTRUCTION_CHOICES:
            valid_instruction_choices.append(check[0])

        # First check to see if the no parameters are entered at all
        if checks_to_be_replaced == ['']:
            return Response(
                {'Must enter valid check ids'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Then check the vaidity of each id that is entered
        for check in checks_to_be_replaced:
            target = Check.objects.filter(id=int(check))
            if target:
                to_update.append(target)
            else:
                valid = False

        # Construct changeDictionary
        for key, value in request.data.items():
            if key == 'contacted' or key == 'instructions':
                change_dict[key] = value
            if key == 'instructions' and value not in valid_instruction_choices:
                valid = False

        # If all of the ids are valid then iterate through the to_update list and update
        # all checks that correspond to the valid ids entered
        if valid is True:
            for target in to_update:
                target.update(**change_dict)
            return Response(
                {'Checks updated': 'The checks  with IDs ' +
                                   request.data['to_modify'] +
                                   ' have been updated'},
                status=status.HTTP_200_OK
            )
        return Response(
            {'Request is not formatted correctly'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @list_route(methods=['patch'], url_path="archive")
    def check_archive(self, request):
        """
        Archives the signature for one specific check

        Must be called on a check that is alredy signed

        Payload: check_id - id for check to have its signatrure archived
                 reason - Reason the signauture was archived
        """
        user_groups = request.user.groups.values_list('name', flat=True)
        if 'keepers_of_the_archive_of_kuali' not in user_groups:
            return Response(
                {'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        # Take in the check_id that needs to be modified
        check_id = request.data['check_id']
        # Take in the reason for modification
        reason = request.data['reason']

        validation_errors = {}
        
        # Check to see if a check_id was entered
        if check_id == '' or type(check_id) is not int:
            validation_errors['check_id'] = 'Please provide a valid check id'

        # Check to see if a reason was entered
        if reason == '':
            validation_errors['reason'] = 'A reason is required in order to archive a signature'

        try:
            # Check the validity of the id that is entered
            check = Check.objects.filter(id=int(check_id))
            # Check that that check has been signed
            signed = Signature.objects.filter(related_check=check)

            if check and signed and reason != '':
                # Retrieve the signature id for the check that needs to be edited
                sig_id = list(check.values('signature')[0].values())[0]
                # Query the signatures objects and grab the one with that id
                signature = Signature.objects.filter(id=int(sig_id))

                # Create a new ArchivedSignature object with all the data in the original
                # signature. Except reset the user to the person who started this request
                ArchivedSignature.objects.create(
                    first_name=list(signature.values('first_name')[0].values())[0],
                    last_name=list(signature.values('last_name')[0].values())[0],
                    reason=reason,
                    signature=list(signature.values('signature')[0].values())[0],
                    related_check=check.first(),
                    user=self.request.user
                )
                # Delete the original signature
                signature.delete()

                # Add a comment to the check containing relevant data
                Comment.objects.create(
                    user=self.request.user,
                    related_check=check.first(),
                    comment='Initial signature archived by {0} for reason: {1}'
                            .format(self.request.user, reason)
                )

                # Return the success status with some relavent information
                return Response(
                    'The check with ID: ' + str(check_id) + ' has had its signature archived',
                    status=status.HTTP_201_CREATED
                )
        except:
            validation_errors['server'] = 'The check_id provided does not have a matching \
                                           signature, or the check_id is invalid'
        
        # Return the errors if the process is not successful
        return Response(
            validation_errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @list_route(methods=['get'], url_path="user-can-archive")
    def user_can_archive(self, request):
        """
        Returns the username for the currently logged in user
        along with whether or not that user can archive
        Response example
        {
            username: charlieday@email.arizona.edu
            canArchive: true
        }
        """
        response_object = {
            'username': request.user.username,
            'canArchive': True
        }
        if not request.user.groups.filter(name='keepers_of_the_archive_of_kuali'):
            response_object.update({'canArchive': False})
        return JsonResponse(response_object, status=status.HTTP_200_OK)
    
class ArchivedSignatureViewSet(viewsets.ModelViewSet):
    """
    An api endpoint for managing archived signatures

    list:
    Return a list of all existing ArchivedSignatures
    """

    serializer_class = ArchivedSignatureSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ArchivedSignature.objects.all().order_by('created')
        check_id = self.request.query_params.get('id', None)
        if check_id is not None:
            queryset = ArchivedSignature.objects.filter(related_check=check_id)
        return queryset

class UnsignedChecksViewSet(viewsets.GenericViewSet, ListModelMixin):
    """
    An api endpoint for retrieving unsigned checks

    list:
    return a list of all existing unsignedchecks
    """

    serializer_class = CheckSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Check.objects.filter(picked_up=False)
        # Set up eager loading to avoid N+1 selects
        queryset = self.get_serializer_class().setup_eager_loading(queryset)
        return queryset
