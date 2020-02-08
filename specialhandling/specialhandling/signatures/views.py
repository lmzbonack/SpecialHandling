"""Signatures app views"""
from rest_framework import status, viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from specialhandling.signatures.models import Signature
from specialhandling.signatures.serializers import SignatureSerializer
from specialhandling.checks.models import Check


class SignatureViewSet(viewsets.ModelViewSet):

    """
    An api endpoint for managing Signatures.

    retrieve:
    Return a single Signature instance.

    list:
    Return a list of all existing Signatures

    create:
    Create a new Signature instance.

    update:
    Update an existing Signature instance.

    create-multiple:
    Create signatures for multiple checks at once. One signature
    will be replicated in association with each check.
    """

    serializer_class = SignatureSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Signature.objects.all().order_by('created')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    # pylint: disable=no-self-use
    @list_route(methods=['post'], url_path="create-multiple")
    def create_multiple(self, request):
        """
        Create signatures for each check listed

        Payload: checks [] - list of checks
                 first_name - first name
                 last_name - last name
                 signature - signature
        """
        to_create = []
        valid = True
        failed = []

        # Check that the 'checks' key exists and has values
        try:
            related_checks = request.data.copy().pop('checks')
            if not request.data['checks']:
                raise KeyError
        except KeyError:
            return Response(
                {'checks': 'There must be a check to update!'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create a signature object to use for each creation later on
        signature = {
            'first_name': request.data['first_name'],
            'last_name': request.data['last_name'],
            'signature': request.data['signature'],
            'related_check': '',
            'user': request.user
        }

        # Verify each check exists
        for check in related_checks:
            rel_check = Check.objects.filter(id=int(check))
            if rel_check:
                to_create.append(int(check))
            else:
                valid = False
                failed.append(int(check))

        # print(to_create)

        # Validate and create the signatures for each check
        if valid:
            for check in to_create:
                # Serialize and raise any validation errors
                signature['related_check'] = check
                serializer = SignatureSerializer(data=signature)
                serializer.is_valid(raise_exception=True)

                # Create
                if serializer.is_valid():
                    serializer.save()

            return Response(
                {'Signatures have been created for the checks: ' + str(to_create)},
                status=status.HTTP_204_NO_CONTENT
            )

        return Response(
            {'Invalid Request: Checks ' + str(failed) + ' do not exist'},
            status=status.HTTP_400_BAD_REQUEST
        )
