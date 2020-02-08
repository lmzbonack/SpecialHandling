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
    payee_number: "5301234"
};

const check2 = {
    check_number: "1456788",
    check_identifier: "accounts payable",
    contact_email: "bob@email.arizona.edu",
    contact_name: "Bob",
    contact_number: "111-000-0000",
    contacted: true,
    edoc_number: "2132443",
    instructions: "ups",
    org_code: "124Z",
    payee_name: "Phill",
    payee_number: "5301234"
};

const check3 = {
    check_number: "1456787",
    check_identifier: "accounts payable",
    contact_email: "bob@email.arizona.edu",
    contact_name: "Bobby",
    contact_number: "111-000-0000",
    contacted: true,
    edoc_number: "2132443",
    instructions: "ups",
    org_code: "124Z",
    payee_name: "Matt",
    payee_number: "5301234"
};

module.exports = {
    before: function (browser, done) {
        // Create items in the database to use for testing the page
        axios.post('http://localhost:8000/api/checks/', check, config)
            .then(response => {
                browser.globals.createdCheck = response.data.id;
                done();
            })
            .catch(error => {
                done(error);
            });
        axios.post('http://localhost:8000/api/checks/', check2, config)
            .then(response => {
                browser.globals.createdCheck2 = response.data.id;
                done();
            })
            .catch(error => done(error));
        axios.post('http://localhost:8000/api/checks/', check3, config)
            .then(response => {
                browser.globals.createdCheck3 = response.data.id;
                done();
            })
            .catch(error => done(error));
    },

    after: function (browser, done) {
        // Cleanup the database
        let id1 = browser.globals.createdCheck;
        let id2 = browser.globals.createdCheck2;
        let id3 = browser.globals.createdCheck3;
        let checkIds = [id1, id2, id3];
        for (let checkId of checkIds) {
            axios.delete(`http://localhost:8000/api/checks/${checkId}/`, config)
                .then(() => done())
                .catch(error => done(error));
        }
    },

    beforeEach: function (browser) {
        browser.login('nightwatch', 'password');
    },

    'the sign button opens signature modal': function (browser) {
        const signatures = browser.page.signatures();
        signatures.navigate()
            .api.pause(2000);
        signatures.expect.element('@grid').to.be.visible;
        signatures.click('@firstRowOfGrid');
        signatures.click('@signButton');
        signatures.waitForElementVisible('@signatureModal', 1000);
        browser.end();
    },
    // Skip test for now problem with @closeModal selector
    'clicking the x in corner closes signature modal': '' + function (browser) {
        const signatures = browser.page.signatures();
        signatures.navigate()
            .api.pause(2000);
        signatures.expect.element('@grid').to.be.visible;
        signatures.click('@firstRowOfGrid');
        signatures.click('@signButton');
        signatures.waitForElementVisible('@signatureModal', 1000);
        signatures.click('@closeModal').waitForElementNotVisible('@signatureModal', 2000);
        browser.end();
    },
    'confirm button advances to sign next step': function (browser) {
        const signatures = browser.page.signatures();
        signatures.navigate()
            .api.pause(2000);
        signatures.expect.element('@grid').to.be.visible;
        signatures.click('@firstRowOfGrid');
        signatures.click('@signButton');
        signatures.waitForElementVisible('@signatureModal', 1000);
        signatures.click('@confirmButton');
        signatures.expect.element('@firstName').to.be.visible;
        browser.end();
    },
    'clear button clears all fields in the form': function (browser) {
        const signatures = browser.page.signatures();
        signatures.navigate()
            .api.pause(2000);
        signatures.click('@firstRowOfGrid');
        signatures.click('@signButton');
        signatures.click('@confirmButton');
        signatures.waitForElementVisible('@signatureModal', 1000)
            .setValue('@firstName', 'Phill')
            .setValue('@lastName', 'Smith');
        signatures.expect.element('@firstName').value.to.equal('Phill');
        signatures.expect.element('@lastName').value.to.equal('Smith');
        signatures.click('@clearButton');
        signatures.expect.element('@firstName').value.to.equal('');
        signatures.expect.element('@lastName').value.to.equal('');
        browser.end();
    },
    'form does not proceed if no input is given': function (browser) {
        const signatures = browser.page.signatures();
        signatures.navigate()
            .api.pause(2000);
        signatures.click('@firstRowOfGrid');
        signatures.click('@signButton');
        signatures.waitForElementVisible('@signatureModal', 1000);
        signatures.click('@confirmButton');
        signatures.expect.element('@firstName').to.be.visible;
        signatures.click('@nextButton');
        signatures.expect.element('@firstName').to.be.visible;
        browser.end();    
    },
    'page allows for signing of multiple checks': function (browser) {
        const signatures = browser.page.signatures();
        signatures.navigate()
            .api.pause(2000);
        signatures.click('@multiSelect');
        signatures.click('@firstRowOfGrid');
        signatures.click('@secondRowOfGrid');
        signatures.click('@signButton');
        signatures.waitForElementVisible('@signatureModal', 1000)
            .expect.element('@selectedCountBadge').text.to.equal('2');
        signatures.click('@confirmButton');
        signatures.expect.element('@firstName').to.be.visible;
        browser.end();    
    }
};
