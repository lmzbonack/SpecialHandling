"""Admin Panel configuration"""
from django.contrib import admin

from specialhandling.signatures.models import Signature


@admin.register(Signature)
class SignatureAdmin(admin.ModelAdmin):

    """Admin panel configuration"""
    fieldsets = (
        ('Signature Data', {
            'fields': [('related_check'),
                       ('first_name', 'last_name'),
                       ('signature'),
                       ('created'),
                       ('modified')]
        }),
        ('User Data', {
            'fields': ['user']
        })
    )
    readonly_fields = ('created', 'modified',)
    list_display = ('first_name', 'last_name', 'related_check', 'user', 'created', 'modified',)
    list_display_links = ('related_check', 'first_name', 'last_name',)
    list_filter = ('related_check', 'first_name', 'last_name', 'user', 'created', 'modified',)