/**
 * Various constants used throughout the application
 */

const instructionsOptions = [ 
    { text: 'Call for pickup', value: 'call for pickup' },
    { text: 'Courier delivery', value: 'courier delivery' },
    { text: 'FedEx', value: 'fedex' },
    { text: 'UPS', value: 'ups' },
    { text: 'Mail in envelope provided', value: 'mail in envelope provided' },
    { text: 'Payroll distribution', value: 'payroll distribution' },
    { text: 'SSN pull', value: 'ssn pull' },
];

const checkIdOptions = [ 
    { text: 'Payroll', value: 'payroll' },
    { text: 'Accounts Payable', value: 'accounts payable' }
];

export {
    instructionsOptions,
    checkIdOptions
};
