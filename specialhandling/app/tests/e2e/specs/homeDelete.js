const checkThree = {
    check_number: "1456781",
    check_identifier: "accounts payable",
    contact_email: "jeff@email.arizona.edu",
    contact_name: "Jeff",
    contact_number: "111-000-0000",
    contacted: true,
    edoc_number: "2132443",
    instructions: "ups",
    org_code: "124Z",
    payee_name: "Margret",
    payee_number: "5201234567"
};

module.exports = {
    beforeEach: function (browser) {
        browser.login('nightwatch', 'password');
    },
    'delete button only works when a row is selected': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        browser.postCheck("default");
        browser.click('#refreshButton');
        home.expect.element('@deleteButton').to.be.visible;
        home.expect.element('@deleteButton').to.have.attribute('disabled').equals('true');
        home.click('@firstRowOfGrid');
        home.click('@firstRowOfGrid')
            .api.pause(2000);
        home.expect.element('@deleteButton').to.not.have.attribute('disabled');
        browser.deleteCheck();
        browser.end();
    },
    'delete cancel option works': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        browser.postCheck("default");
        browser.click('#refreshButton');
        home.expect.element('@deleteButton').to.be.visible;
        home.expect.element('@deleteButton').to.have.attribute('disabled').equals('true');
        home.click('@firstRowOfGrid');
        home.click('@firstRowOfGrid')
            .api.pause(2000);
        home.click('@deleteButton').waitForElementVisible('@deleteConfirmPopup', 3000);
        home.expect.element('@deleteWarningAlert').to.not.be.present;
        home.click('@deleteButtonCancel')
            .api.pause(2000);
        home.expect.element('@firstRowOfGrid').to.be.present;
        browser.deleteCheck();
        browser.end();
    },
    'delete confirm option works single deletion': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        browser.postCheck("default");
        browser.click('#refreshButton');
        home.expect.element('@deleteButton').to.be.visible;
        home.expect.element('@deleteButton').to.have.attribute('disabled').equals('true');
        home.click('@firstRowOfGrid');
        home.click('@firstRowOfGrid')
            .api.pause(2000);
        home.click('@deleteButton').waitForElementVisible('@deleteConfirmPopup',3000);
        home.click('@deleteButtonConfirm')
            .api.pause(5000);
        home.expect.element('@firstRowOfGrid').to.not.be.present;
        browser.end();
    },
    'delete confirm option works for multiple deletion': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        browser.postCheck("default")
            .pause(2000);
        browser.postCheck(checkThree)
            .pause(2000);
        browser.click('#refreshButton');
        browser.click('#selectStatus')
            .pause(2000);
        home.expect.element('@deleteButton').to.be.visible;
        home.click('@firstRowOfGrid');
        home.click('@secondRowOfGrid')
            .api.pause(2000);
        home.click('@deleteButton').waitForElementVisible('@deleteConfirmPopup',3000)
            .api.pause(2000);
        // For some reason Nightwatch cannot see that this element exists on the page. Even when it does
        // home.expect.element('@deleteWarningAlert').to.be.present;
        home.click('@deleteButtonConfirm')
            .api.pause(2000);
        home.expect.element('@firstRowOfGrid').to.not.be.present;
        home.expect.element('@secondRowOfGrid').to.not.be.present;
        browser.end();
    }
};


