var commands = {
    doubleClickFirstRowOfGrid () {
        this.moveToElement('@firstRowOfGrid', 10, 10)
            .api.doubleClick();
        return this;
    }
};

module.exports = {
    url: 'http://localhost:8000/#/signed-checks',
    commands: [commands],
    elements: {
        grid: {
            selector: '#borderLayout_eGridPanel'
        },
        firstRowOfGrid: {
            selector: '//div[contains(@class,"ag-body-container")]/div[@row-id="0"]',
            locateStrategy: 'xpath'
        },
        viewDetailsButton: {
            selector: '#detailsButton'
        },
        detailsModal: {
            selector: '#detailsModal .modal'
        },
        payeeNumber: {
            selector: '.details-modal__data p:first-child'
        },
        commentInput: {
            selector: '#newComment'
        },
        commentSubmit: {
            selector: '#submitComment'
        },
        firstComment: {
            selector: '//ul/div[contains(@class,"list-group-item")]/p',
            locateStrategy: 'xpath'
        },
        deleteButton: {
            selector: '#deleteButton'
        },
        archiveName: {
            selector: '#archiveName'
        },
        archiveReason: {
            selector: '#archiveReason'
        },
        archiveConfirm: {
            selector: '#archiveConfirm'
        }
    }
};
