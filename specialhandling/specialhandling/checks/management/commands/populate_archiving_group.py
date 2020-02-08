from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand, CommandError

class Command(BaseCommand):
    help = 'Add users to keepers_of_the_archive_of_kuali group'

    def add_arguments(self, parser):
        parser.add_argument(
            '-u', '--usernames',
            dest='usernames',
            default=None,
            help='specifies a list of comma separated usernames to be added to the \
            keepers_of_the_archive_of_kuali group'
        )

    def handle(self, *args, **options):
        """Validate username and add to group"""
        usernames = options['usernames']
        self.stdout.write(usernames)

        if not usernames:
            raise CommandError('A `-u` or --usernames` argument followed \
                    by a valid comma separated string of usernames must be specified. \
                    eg. lmzbonack@arizona.edu,robertrabert@arizona.edu')

        usernames_list = usernames.split(',')

        keepers_group = Group.objects.get(name='keepers_of_the_archive_of_kuali')

        for item in usernames_list:
            user = User.objects.get(username=item)
            keepers_group.user_set.add(user)
            self.stdout.write("Added user " + user.username)
