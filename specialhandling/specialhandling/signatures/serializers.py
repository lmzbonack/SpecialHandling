"""Signatures app serializers"""
from rest_framework import serializers
from django.contrib.auth.models import User

from specialhandling.signatures.models import Signature


class SignatureSerializer(serializers.ModelSerializer):

    """Signature Serializer"""

    user = serializers.SlugRelatedField(slug_field='username',
                                        queryset=User.objects.all(),
                                        required=False)

    class Meta:
        model = Signature
        fields = ('id', 'first_name', 'last_name', 'signature',
                  'related_check', 'user', 'created', 'modified',)
