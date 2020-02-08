"""Comments Endpoint Serializers"""

from django.contrib.auth.models import User
from rest_framework import serializers

from specialhandling.comments.models import Comment
from specialhandling.checks.models import Check


class CommentSerializer(serializers.ModelSerializer):

    """Comment Serializer"""

    related_check = serializers.SlugRelatedField(
        queryset=Check.objects.all(),
        slug_field='id',
        required=True
    )

    user = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field='username',
        required=False
    )

    class Meta:
        model = Comment
        fields = ('related_check', 'comment', 'user', 'created', 'modified',)
