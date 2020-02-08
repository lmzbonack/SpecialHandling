"""Comments endpoint views"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Comment
from .serializers import CommentSerializer


class CommentsViewSet(viewsets.ModelViewSet):

    """View Set for Comments"""

    serializer_class = CommentSerializer
    
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.all().order_by('created')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)
