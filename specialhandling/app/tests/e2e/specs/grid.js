let axios = require('axios');

const config = {
    auth: {
        username: 'nightwatch',
        password: 'password'
    }
};

module.exports = {
    before: function (browser, done) {
        // Create items in the database to use for testing the page
        const checkOne = {
            check_number: "1476589",
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
        const checkTwo = {
            check_number: "1546789",
            check_identifier: "accounts payable",
            contact_email: "luc@email.arizona.edu",
            contact_name: "Luc",
            contact_number: "111-000-0000",
            contacted: true,
            edoc_number: "2132443",
            instructions: "ups",
            org_code: "124Z",
            payee_name: "Margret",
            payee_number: "5201234567"
        };
        axios.post('http://localhost:8000/api/checks/', checkOne, config)
            .then(response => {
                browser.globals.createdCheckOne = response.data.id;
                done();
            })
            .catch(error => done(error));
        axios.post('http://localhost:8000/api/checks/', checkTwo, config)
            .then(response => {
                browser.globals.createdCheckTwo = response.data.id;
                done();
            })
            .catch(error => done(error));
    },
    
    after: function (browser, done) {
        // Cleanup the database
        let idOne = browser.globals.createdCheckOne;
        let idTwo = browser.globals.createdCheckTwo;
        axios.delete(`http://localhost:8000/api/checks/${idOne}/`, config)
            .then(() => done())
            .catch(error => done(error));
        axios.delete(`http://localhost:8000/api/checks/${idTwo}/`, config)
            .then(() => done())
            .catch(error => done(error));
    },

    'single and multiselect work': function (browser) {
        browser.login('nightwatch', 'password');
        browser
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 3000);
        browser.expect.element('div[id=selectStatus] button div').text.to.equal('Single');
        browser
            .pause(1000)
            .useXpath()
            .click('//div[contains(@class,"ag-body-container")]/div[@row-id="0"]')
            .assert.cssClassPresent('//div[contains(@class,"ag-body-container")]/div[@row-id="0"]', "ag-row-selected")
            .useCss()
            .click('div[id=selectStatus]')
            .pause(1000);
        browser.expect.element('div[id=selectStatus] button div').text.to.equal('Multiple');
        browser
            .pause(1000)
            .useXpath()
            .click('//div[contains(@class,"ag-body-container")]/div[@row-id="0"]')
            .assert.cssClassPresent('//div[contains(@class,"ag-body-container")]/div[@row-id="0"]', "ag-row-selected")
            .click('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]')
            .assert.cssClassPresent('//div[contains(@class,"ag-body-container")]/div[@row-id="0"]', "ag-row-selected")
            .end();
    },

    'select all and select none work': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 3000)
            .click('#selectStatus button.dropdown-toggle')
            .click('#selectAll')
            .pause(2000)
            .useXpath()
            .assert.cssClassPresent('//div[contains(@class,"ag-body-container")]/div[@row-id="0"]', "ag-row-selected")
            .assert.cssClassPresent('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]', "ag-row-selected")
            .useCss()
            .click('#selectStatus button.dropdown-toggle')
            .click('#selectNone')
            .pause(2000)
            .useXpath()
            .assert.cssClassNotPresent('//div[contains(@class,"ag-body-container")]/div[@row-id="0"]', "ag-row-selected")
            .assert.cssClassNotPresent('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]', "ag-row-selected")
            .end();
    },
    
    'refresh button works': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 3000)
            .click('#selectStatus button.dropdown-toggle')
            .click('#selectAll')
            .useXpath()
            .assert.cssClassPresent('//div[contains(@class,"ag-body-container")]/div[@row-id="0"]', "ag-row-selected")
            .assert.cssClassPresent('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]', "ag-row-selected")
            .postCheck("default")
            .pause(2000)
            .useCss()   
            .click('#refreshButton')
            .click('#selectStatus button.dropdown-toggle')
            .click('#selectAll')
            .pause(2000)
            .useXpath()
            .assert.cssClassPresent('//div[contains(@class,"ag-body-container")]/div[@row-id="0"]', "ag-row-selected")
            .assert.cssClassPresent('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]', "ag-row-selected")
            .assert.cssClassPresent('//div[contains(@class,"ag-body-container")]/div[@row-id="2"]', "ag-row-selected")
            .deleteCheck()
            .end();
    },

    'quick/fuzzy search works': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 1000)
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="0"]').to.be.present;
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.be.present;
        browser
            .useCss()
            .setValue('#quickFilterBox__home','1476589')
            .pause(5000)
            .click('#selectStatus button.dropdown-toggle')
            .click('#selectAll')
            .pause(2000)
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.not.be.present;
        browser
            .end();
    },

    'export dropdown works as intended': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 1000)
            .click("#exportDropdown")
            .click("#buttonExportCsv")
            .pause(2000);
        browser.expect.element('#csvModal').to.be.visible;
        browser
            .end();
    },

    'column filtering works': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 1000)
            .click("#columnsFilterButton")
            .useXpath()
            .moveToElement('//span[contains(@class,"custom-control-indicator")]',0,0)
            .mouseButtonClick('left')
            .pause(5000)
            .end();
    },

    'can use advanced search filters to filter payee name': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 1000)
            .pause(5000)
            .postCheck("default")
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.be.present;
        browser
            .useCss()
            .click('#refreshButton')
            .click('#advancedSearch')
            .pause(2000)
            .setValue('#selectPayeeName','Large Marge')
            .pause(5000)
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.not.be.present;
        browser
            .deleteCheck()
            .pause(2000)
            .end();
    },    

    'can use advanced search filters to filter payee number': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 1000)
            .pause(5000)
            .postCheck("default")
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.be.present;
        browser
            .useCss()
            .click('#refreshButton')
            .click('#advancedSearch')
            .pause(2000)
            .setValue('#selectPayeeNumber','5207950054')
            .pause(5000)
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.not.be.present;
        browser
            .deleteCheck()
            .pause(2000)
            .end();
    },

    'can use advanced search filters to filter edoc number': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 1000)
            .pause(5000)
            .postCheck("default")
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.be.present;
        browser
            .useCss()
            .click('#refreshButton')
            .click('#advancedSearch')
            .pause(2000)
            .setValue('#selectEdocNumber','1234567')
            .pause(5000)
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.not.be.present;
        browser
            .deleteCheck()
            .pause(2000)
            .end();
    },

    'can use advanced search filters to filter org code': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 1000)
            .pause(5000)
            .postCheck("default")
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.be.present;
        browser
            .useCss()
            .click('#refreshButton')
            .click('#advancedSearch')
            .pause(2000)
            .setValue('#selectOrgCode','1358')
            .pause(5000)
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.not.be.present;
        browser
            .deleteCheck()
            .pause(2000)
            .end();
    },

    'can use advanced search filters to filter check number': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 1000)
            .pause(5000)
            .postCheck("default")
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.be.present;
        browser
            .useCss()
            .click('#refreshButton')
            .click('#advancedSearch')
            .pause(2000)
            .setValue('#selectCheckNumber','7788994')
            .pause(5000)
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.not.be.present;
        browser
            .deleteCheck()
            .pause(2000)
            .end();
    },

    'can use advanced search filters to filter contact name': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 1000)
            .pause(5000)
            .postCheck("default")
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.be.present;
        browser
            .useCss()
            .click('#refreshButton')
            .click('#advancedSearch')
            .pause(2000)
            .setValue('#selectContactName','Lucy')
            .pause(5000)
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.not.be.present;
        browser
            .deleteCheck()
            .pause(2000)
            .end();
    },

    'can use advanced search filters to filter contact number': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 1000)
            .pause(5000)
            .postCheck("default")
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.be.present;
        browser
            .useCss()
            .click('#refreshButton')
            .click('#advancedSearch')
            .pause(2000)
            .setValue('#selectContactNumber','520-879-1111')
            .pause(5000)
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.not.be.present;
        browser
            .deleteCheck()
            .pause(2000)
            .end();
    },

    'can use advanced search filters to filter contact email': function (browser) {
        browser
            .useCss()
            .login('nightwatch', 'password')
            .url('http://localhost:8000/')
            .waitForElementVisible('#borderLayout_eGridPanel', 1000)
            .pause(5000)
            .postCheck("default")
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.be.present;
        browser
            .useCss()
            .click('#refreshButton')
            .click('#advancedSearch')
            .pause(2000)
            .setValue('#selectContactEmail','lucy@email.arizona.edu')
            .pause(5000)
            .useXpath();
        browser.expect.element('//div[contains(@class,"ag-body-container")]/div[@row-id="1"]').to.not.be.present;
        browser
            .deleteCheck()
            .pause(2000)
            .end();
    },
};
