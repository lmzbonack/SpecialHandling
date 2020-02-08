module.exports = {
    'create button opens create modal': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        home.expect.element('@grid').to.be.visible;
        home.click('@createButton');
        home.waitForElementVisible('@createModal', 2000);
        browser.end();
    },

    'cancel button closes the create modal': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        home.expect.element('@grid').to.be.visible;
        home.expect.element('@createModal').to.not.be.visible;
        home.click('@createButton').waitForElementVisible('@payeeNumber', 2000);
        home.click('@closeCreateModalButton').waitForElementNotVisible('@createModal', 2000);
        browser.end();
    },

    'clear button clears the fields in the create modal': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        home.expect.element('@grid').to.be.visible;
        home.click('@createButton');
        home.setValue('@payeeNumber', '12345');
        home.click('@clearCreateModalButton');
        home.expect.element('@payeeNumber').text.to.not.contain('12345');
        browser.end();
    },

    'save and copy button saves appropriate fields': function (browser) {
        browser.login('nightwatch', 'password');
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        home.expect.element('@grid').to.be.visible;
        home.click('@createButton');
        home.setValue('@payeeNumber', '1234567');
        home.setValue('@payeeName', 'Whatever');
        home.setValue('@contactName', 'Billy Bob');
        home.setValue('@contactNumber', '520-123-4567');
        home.setValue('@contactEmail', 'billy@bob.gov');
        home.click('@checkIdentifier');
        home.click('@checkIdentifierPayroll');
        home.click('@instructionsIdentifier');
        home.click('@instructionsIdentifierCall');
        home.setValue('@edocNumber', '1234567');
        home.setValue('@orgCode', '7774');
        home.setValue('@checkNumber', '7654321');
        home.click('@saveAndCopyModalButton').waitForElementVisible('@createModal', 2000);
        home.expect.element('@contactName').have.value.which.contain('Billy Bob');
        home.expect.element('@contactNumber').have.value.which.contain('520-123-4567');
        home.expect.element('@contactEmail').have.value.which.contain('billy@bob.gov');
        home.click('@closeCreateModalButton').waitForElementVisible('@createModal', 2000)
            .api.pause(2000);
        home.click('@firstRowOfGrid')
            .api.pause(2000);
        home.click('@deleteButton').waitForElementVisible('@deleteConfirmPopup',3000);
        home.click('@deleteButtonConfirm');
        browser.end();
    }
};
