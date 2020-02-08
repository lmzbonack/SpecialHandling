"""Checks Endpoint Serializers"""
from rest_framework import serializers
from django.contrib.auth.models import User

from specialhandling.checks.models import Check, ArchivedSignature
from specialhandling.signatures.serializers import SignatureSerializer
from specialhandling.comments.serializers import CommentSerializer


class ArchivedSignatureSerializer(serializers.ModelSerializer):

    """ArchivedSignature Serializer"""

    user = serializers.SlugRelatedField(slug_field='username',
                                    queryset=User.objects.all(),
                                    required=False)

    class Meta:
        model = ArchivedSignature
        fields = ('id', 'first_name', 'last_name', 'reason', 'signature',
                  'related_check', 'user', 'created', 'modified',)

class CheckSerializer(serializers.ModelSerializer):

    """Serializer class for checks"""

    user = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field='username',
        required=False
    )
    comments = CommentSerializer(many=True, required=False, read_only=True)
    signature = SignatureSerializer(required=False, read_only=True)
    archived_signatures = ArchivedSignatureSerializer(many=True, required=False, read_only=True)

    def validate(self, data):
        """Check that if check_id is accounts payable then a valid edoc is defined"""
        # pylint: disable=W0221
        if data['check_identifier'] == "accounts payable" and data['edoc_number'] is None:
            raise serializers.ValidationError("Edoc Number must be defined for Accounts Payable")
        elif data['check_identifier'] == "payroll" and data['edoc_number'] is not None:
            raise serializers.ValidationError("Edoc Number must be null for Payroll")
        else:
            return data

    @staticmethod
    def setup_eager_loading(queryset):
        """Perform eager loading of relationship data to reduce db calls."""
        # Select related "to-one" relationships
        queryset = queryset.select_related('user')
        queryset = queryset.select_related('signature')

        # Pre-fetch related "to-many" relationships
        queryset = queryset.prefetch_related('comments',)
        queryset = queryset.prefetch_related('archived_signatures',)
        return queryset

    class Meta:
        model = Check
        fields = ('check_number', 'check_identifier', 'contact_name', 'contact_number',
                  'contact_email', 'contacted', 'comments', 'created', 'edoc_number', 'id',
                  'instructions', 'modified', 'org_code', 'payee_name', 'payee_number',
                  'picked_up', 'signature', 'archived_signatures', 'user', 'due_date')
        extra_kwargs = {
            'edoc_number': {
                'error_messages': {
                    'invalid': 'Please enter a valid 7 digit number.'
                }
            },
            'check_identifier': {
                'error_messages': {
                    'invalid_choice': 'Please select an option.'
                }
            },
            'instructions': {
                'error_messages': {
                    'invalid_choice': 'Please select an option.'
                }
            }
        }
