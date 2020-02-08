"""Constants for Checks App"""

PHONE_REGEX = r'(\d{1}-)?\d{3}-\d{3}-\d{4}( ext \d{1,})?$'
PHONE_MESSAGE = ('Enter a valid phone number (example: 1-234-567-8910',
                 'or 123-456-7890, or 1-234-567-8910 ext 3348).',)
ORG_REGEX = r'^[A-Za-z0-9]{2,4}$'
ORG_MESSAGE = 'Please enter a 2-4 digit alphanumeric code.'
CHECK_NUM_REGEX = r'^[0-9]*$'
CHECK_NUM_MESSAGE = 'Please enter a valid check number (Numbers only)'
PAYEE_NUM_REGEX = r'^[0-9-]*$'
PAYEE_NUM_MESSAGE = 'Please enter a valid payee number (Numbers and `-` only)'
