let commands = {
    doubleClickFirstRowOfGrid () {
        this.moveToElement('@firstRowOfGrid', 10, 10)
            .api.doubleClick();
        return this;
    },
    doubleClickSecondRowOfGrid () {
        this.moveToElement('@secondRowOfGrid', 10, 10)
            .api.doubleClick();
        return this;
    }
};

module.exports = {
    url: 'http://localhost:8000/#/home',
    commands: [commands],
    elements: {
        // Grid related elements
        grid: {
            selector: '#borderLayout_eGridPanel'
        },
        firstRowOfGrid: {
            selector: '//div[contains(@class,"ag-body-container")]/div[@row-id="0"]',
            locateStrategy: 'xpath'
        },
        firstRowOfGridInstructions: {
            selector: '//div[contains(@class,"ag-body-container")]/div[@row-id="0"]/div[@col-id="instructions"]/p',
            locateStrategy: 'xpath'
        },
        secondRowOfGrid: {
            selector: '//div[contains(@class,"ag-body-container")]/div[@row-id="1"]',
            locateStrategy: 'xpath'
        },
        secondRowOfGridInstructions: {
            selector: '//div[contains(@class,"ag-body-container")]/div[@row-id="1"]/div[@col-id="instructions"]/p',
            locateStrategy: 'xpath'
        },
        // Main buttons on the top left of the page
        createButton: {
            selector: '#createButton'
        },
        editButton: {
            selector: '#editButton'
        },
        deleteButton: {
            selector: '#deleteButton'
        },
        // Delete Popover
        deleteConfirmPopup: {
            selector: '#deleteConfirmPopup'
        },
        deleteButtonConfirm: {
            selector: '#deleteButtonConfirm'
        },
        deleteButtonCancel: {
            selector: '#deleteButtonCancel'
        },
        deleteWarningAlert: {
            selector: '#multipleWarning'
        },
        // Edit Modal selectors
        editModal: {
            selector: '#editModal .modal'
        },
        multipleEditModal: {
            selector: '#multipleEditModal .modal'
        },
        multipleEditCancel: {
            selector: '#multipleEditCancel'
        },
        multipleEditSave: {
            selector: '#multipleEditSave'
        },
        commentTextInput: {
            selector: '#newComment'
        },
        submitComment: {
            selector: '#submitComment'
        },
        commentArea: {
            selector: '//div[contains(@class,"list-group-item justify-content-between")]/p[contains(@class,"mb-1")]',
            locateStrategy: 'xpath'
        },
        closeEditModalButton: {
            selector: '#closeEditModal'
        },
        clearEditModalButton: {
            selector: '#clearEditModal'
        },
        saveEditModalButton: {
            selector: '#saveEditModal'
        },
        // Create Modal Selector and associated buttons
        createModal: {
            selector: '#createModal .modal'
        },
        closeCreateModalButton: {
            selector: '#closeCreateModal'
        },
        clearCreateModalButton: {
            selector: '#clearCreateModal'
        },
        saveAndCopyModalButton: {
            selector: '#saveAndCopyCreateModal'
        },
        saveModalButton: {
            selector: '#saveCreateModal'
        },
        // Selectors for input fields in create and edit modals
        payeeNumber: {
            selector: '#payeeNumber'
        },
        payeeName: {
            selector: '#payeeName'
        },
        edocNumber: {
            selector: '#edocNum'
        },
        checkIdentifier: {
            selector: '//div[contains(@class,"multiselect")]/div[contains(@class,"multiselect__tags")][input[contains(@id,"checkIdentifier")]]',
            locateStrategy: 'xpath'
        },
        checkIdentifierPayroll: {
            selector: '//div[contains(@class,"multiselect")][div[contains(@class,"multiselect__tags")][input[contains(@id,"checkIdentifier")]]]/div[contains(@class,"multiselect__content-wrapper")]/ul[contains(@class,"multiselect__content")]/li[contains(@class,"multiselect__element")]',
            locateStrategy: 'xpath'
        },
        orgCode: {
            selector: '#orgCode'
        },
        checkNumber: {
            selector: '#checkNumber'
        },
        instructionsIdentifier: {
            selector: '//div[contains(@class,"multiselect")]/div[contains(@class,"multiselect__tags")][input[contains(@id,"instructions")]]',
            locateStrategy: 'xpath'
        },
        instructionsIdentifierCall: {
            selector: '//div[contains(@class,"multiselect")][div[contains(@class,"multiselect__tags")][input[contains(@id,"instructions")]]]/div[contains(@class,"multiselect__content-wrapper")]/ul[contains(@class,"multiselect__content")]/li[contains(@class,"multiselect__element")]',
            locateStrategy: 'xpath'
        },
        contactName: {
            selector: '#contactName'
        },
        contactNumber: {
            selector: '#contactNumber'
        },
        contactEmail: {
            selector: '#contactEmail'
        }
    }
};
