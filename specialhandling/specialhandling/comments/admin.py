"""Admin panel configuration"""
from django.contrib import admin

from specialhandling.comments.models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):

    """Admin Panel configuration"""

    fieldsets = (
        ('Comment Data', {
            'fields': [('related_check'),
                       ('comment'),
                       ('created'),
                       ('modified')]
        }),
        ('User Data', {
            'fields': ['user']
        })
    )
    readonly_fields = ('created', 'modified',)
    list_display = ('id', 'related_check', 'user', 'created', 'modified', 'comment',)
    list_display_links = ('id', 'related_check',)
    list_filter = ('related_check', 'user', 'created', 'modified',)
    search_fields = ('comment',)