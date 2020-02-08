from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Create keepers_of_the_archive_of_kuali group'

    def handle(self, *args, **kwargs):
        self.stdout.write("Attempting to create library for the sacred texts")
        Group.objects.get_or_create(name='keepers_of_the_archive_of_kuali')
        self.stdout.write("Library created for the sacred texts")
