"""Admin panel configuration"""
from django.contrib import admin

from specialhandling.checks.models import Check, ArchivedSignature

class CheckAdmin(admin.ModelAdmin):

    """Admin panel configuration"""
    fieldsets = (
        ('Check Data', {
            'fields': [('payee_number', 'payee_name'),
                       ('check_identifier', 'edoc_number'),
                       ('org_code', 'check_number'),
                       ('due_date', 'instructions'),
                       ('contacted', 'picked_up'),
                       ('created'),
                       ('modified')]
        }),
        ('Contact Data', {
            'fields': ('contact_name', 'contact_number', 'contact_email')
        }),
        ('User Data', {
            'fields': ['user']
        }),
    )
    readonly_fields = ('created', 'modified',)
    list_display = ('payee_name', 'payee_number', 'edoc_number',
                    'org_code', 'instructions', 'check_number', 'check_identifier',
                    'contact_name', 'contact_number', 'contact_email', 'contacted',
                    'picked_up', 'user', 'created', 'modified',)
    list_filter = ('contacted', 'picked_up', 'user', 'created', 'modified')
    search_fields = ('payee_name', 'payee_number', 'edoc_number', 'org_code',
                     'check_number', 'contact_name', 'contact_email',)


class ArchivedSignatureAdmin(admin.ModelAdmin):

    """Admin panel configuration"""
    fieldsets = (
        ('Signature Data', {
            'fields': [('related_check'),
                       ('first_name', 'last_name'),
                       ('reason'),
                       ('signature'),
                       ('created'),
                       ('modified')]
        }),
        ('User Data', {
            'fields': ['user']
        }),
    )
    readonly_fields = ('created', 'modified',)
    list_display = ('related_check', 'first_name', 'last_name',
                    'reason', 'user', 'created', 'modified',)
    list_display_links = ('first_name', 'last_name')
    list_filter = ('related_check', 'first_name', 'last_name',
                   'reason', 'user', 'created', 'modified',)

admin.site.register(ArchivedSignature, ArchivedSignatureAdmin)
admin.site.register(Check, CheckAdmin)