let axios = require('axios');

const config = {
    auth: {
        username: 'nightwatch',
        password: 'password'
    }
};

const check = {
    check_number: "1456789",
    check_identifier: "accounts payable",
    contact_email: "jeff@email.arizona.edu",
    contact_name: "Jeff",
    contact_number: "111-000-0000",
    contacted: true,
    edoc_number: "2132443",
    instructions: "ups",
    org_code: "124Z",
    payee_name: "Margret",
    payee_number: "5301234567"
};

module.exports = {
    before: function (browser, done) {
        // Create items in the database to use for testing the page
        axios.post('http://localhost:8000/api/checks/', check, config)
            .then(response => {
                browser.globals.createdCheck = response.data.id;
                const signature = {
                    first_name: "Jeff",
                    last_name: "Jefferson",
                    signature: "bjdlflsjssSVGlfslj",
                    related_check: response.data.id
                };
                axios.post('http://localhost:8000/api/signatures/', signature, config)
                    .then(response => {
                        browser.globals.createdSignature = response.data.id;
                        done();
                    })
                    .catch(error => done(error));
            })
            .catch(error => done(error));
    },

    after: function (browser, done) {
        // Cleanup the database
        let checkId = browser.globals.createdCheck;
        // let sigId = browser.globals.createdSignature;
        axios.delete(`http://localhost:8000/api/checks/${checkId}/`, config)
            .then(() => done())
            .catch(error => done(error));
    },
    'the view details button opens a check instance': function (browser) {
        browser.login('nightwatch', 'password');
        const signedChecks = browser.page.signedChecks();
        signedChecks.navigate()
            .api.pause(2000);
        signedChecks.expect.element('@grid').to.be.visible;
        signedChecks.click('@firstRowOfGrid');
        signedChecks.click('@viewDetailsButton');
        signedChecks.waitForElementVisible('@detailsModal', 1000);
        browser.pause(4000);
        signedChecks.expect.element('@payeeNumber').text.to.contain(check.payee_number);
        browser.end();
    },
    'user cannot see archive button if not in correct group': function (browser) {
        browser.login('nightwatch', 'password');
        const signedChecks = browser.page.signedChecks();
        signedChecks.navigate()
            .api.pause(2000);
        signedChecks.expect.element('@grid').to.be.visible;
        signedChecks.click('@firstRowOfGrid');
        signedChecks.click('@viewDetailsButton');
        browser.pause(5000);
        signedChecks.expect.element('@deleteButton').to.not.be.present;
        browser.end();
    },
    'double clicking a row opens a check instance': function (browser) {
        browser.login('nightwatch', 'password');
        const signedChecks = browser.page.signedChecks();
        signedChecks.navigate()
            .api.pause(2000);
        signedChecks.expect.element('@grid').to.be.visible;
        signedChecks.moveToElement('@firstRowOfGrid', 10, 10)
            .api.doubleClick();
        browser.pause(2000);
        signedChecks.waitForElementVisible('@detailsModal', 1000);
        signedChecks.expect.element('@payeeNumber').text.to.contain(check.payee_number);
        browser.end();
    },
    'can add a comment to a check': function (browser) {
        browser.login('nightwatch', 'password');
        const signedChecks = browser.page.signedChecks();
        signedChecks.navigate()
            .api.pause(2000);
        signedChecks.expect.element('@grid').to.be.visible;
        signedChecks.moveToElement('@firstRowOfGrid', 10, 10)
            .api.doubleClick();
        signedChecks.waitForElementVisible('@detailsModal', 1000);
        signedChecks.setValue('@commentInput', 'Creating a comment.')
            .click('@commentSubmit')
            .waitForElementVisible('@firstComment', 1000)
            .expect.element('@firstComment').text.to.contain('Creating a comment.');
        browser.end();
    },
    'user can see archive button if they are in the correct group': function (browser) {
        browser.inductKeeper('nightwatch', 'password');
        const signedChecks = browser.page.signedChecks();
        signedChecks.navigate()
            .api.pause(2000);
        signedChecks.expect.element('@grid').to.be.visible;
        signedChecks.click('@firstRowOfGrid');
        signedChecks.click('@viewDetailsButton');
        browser.pause(2000);
        signedChecks.expect.element('@deleteButton').to.be.present;
        browser.useCss();
        // For some reason @deleteButtond does not work here
        browser.click('#deleteButton');
        browser.pause(2000);
        signedChecks.setValue('@archiveName', "Margret");
        signedChecks.setValue('@archiveReason', "I don't like Margret");
        signedChecks.click('@archiveConfirm');
        browser.excommunicateKeeper();
        signedChecks.navigate();
        signedChecks.expect.element('@grid').to.be.visible;
        signedChecks.expect.element('@firstRowOfGrid').to.not.be.present;
        browser.end();
    },
};


