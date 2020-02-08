let commands = {
    doubleClickFirstRowOfGrid () {
        this.moveToElement('@firstRowOfGrid', 10, 10)
            .api.doubleClick();
        return this;
    }
};
module.exports = {
    url: 'http://localhost:8000/#/signatures',
    commands: [commands],
    elements: {
        grid: {
            selector: '#borderLayout_eGridPanel'
        },
        firstRowOfGrid: {
            selector: '//div[contains(@class,"ag-body-container")]/div[@row-id="0"]',
            locateStrategy: 'xpath'
        },
        secondRowOfGrid: {
            selector: '//div[contains(@class,"ag-body-container")]/div[@row-id="1"]',
            locateStrategy: 'xpath'
        },
        signButton: {
            selector: '#signButton'
        },
        signatureModal: {
            selector: '#signatureModal .modal'
        },
        closeModal: {
            selector: '//button[contains(@class,"close")]',
            locateStrategy: 'xpath'
        },
        multiSelect: {
            selector: '//button[contains(@class,"btn-outline-primary")]',
            locateStrategy: 'xpath'
        },
        confirmButton: {
            selector: '#confirmButton'
        },
        firstName: {
            selector: '#firstNameTextBox'
        },
        lastName: {
            selector: '#lastNameTextBox'
        },
        clearButton: {
            selector: '#clearButton'
        },
        nextButton: {
            selector: '#nextButton'
        },
        selectedCountBadge: {
            selector: 'span.badge.badge-uared'
        }
    }
};
