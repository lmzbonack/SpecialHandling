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

    beforeEach: function (browser) {
        browser.login('nightwatch', 'password');
    },

    'edit button only works when a row is selected': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        home.expect.element('@editButton').to.be.visible;
        home.expect.element('@editButton').to.have.attribute('disabled').equals('true');
        home.click('@firstRowOfGrid')
            .api.pause(2000);
        home.expect.element('@editButton').to.not.have.attribute('disabled');
        browser.deleteCheck();
        browser.end();
    },
    
    'edit button opens edit modal': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        home.expect.element('@grid').to.be.visible;
        home.click('@firstRowOfGrid')
            .api.pause(2000);
        home.click('@editButton');
        home.waitForElementVisible('@editModal', 2000);
        browser.end();
    },
    
    'double clicking row opens edit modal + comments can be added': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        home.expect.element('@grid').to.be.visible;
        home.doubleClickFirstRowOfGrid()
            .api.pause(2000);
        home.waitForElementVisible('@editModal', 2000);
        home.setValue('@commentTextInput', 'Look at this comment. Man it looks good');
        home.click('@submitComment')
            .api.pause(2000);
        home.expect.element('@commentArea').have.text.which.contain('Look at this comment. Man it looks good');
        browser.end();
    },
   
    'cancel button closes the form': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        home.expect.element('@grid').to.be.visible;
        home.doubleClickFirstRowOfGrid();
        home.waitForElementVisible('@editModal', 2000);
        home.click('@closeEditModalButton').waitForElementNotVisible('@editModal', 2000);
        browser.end();        
    },
    
    'clear button clears the fields in the edit modal': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        home.expect.element('@grid').to.be.visible;
        home.doubleClickFirstRowOfGrid();
        home.waitForElementVisible('@editModal', 2000);
        home.setValue('@payeeNumber', '12345');
        home.click('@clearEditModalButton');
        home.expect.element('@payeeNumber').text.to.not.contain('12345');
        browser.end();
    },

    'save button saves the changes to the check': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        home.expect.element('@grid').to.be.visible;
        home.doubleClickFirstRowOfGrid();
        home.waitForElementVisible('@editModal', 2000);
        home.setValue('@payeeName', ' Tudor')
            .api.pause(2000);
        home.click('@saveEditModalButton')
            .api.pause(2000);
        home.doubleClickSecondRowOfGrid().waitForElementVisible('@editModal', 2000)
            .api.pause(2000);
        home.expect.element('@payeeName').to.have.value.that.equals('Margret');
        browser.end();   
    },

    'multiple edit form opens when multiple rows are selected + cancel button works': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        home.expect.element('@grid').to.be.visible;
        browser.click('#selectStatus button.dropdown-toggle');
        browser.click('#selectAll');
        home.click('@editButton');
        home.waitForElementVisible('@multipleEditModal', 2000);
        home.click('@multipleEditCancel');
        home.waitForElementNotVisible('@multipleEditModal', 2000)
            .api.pause(2000);
        browser.end();
    },

    'save button saves the changes to the check multiple': function (browser) {
        const home = browser.page.home();
        home.navigate()
            .api.pause(2000);
        home.expect.element('@grid').to.be.visible;
        browser.click('#selectStatus button.dropdown-toggle');
        browser.click('#selectAll');
        home.click('@editButton');
        home.waitForElementVisible('@multipleEditModal', 2000);
        home.click('@instructionsIdentifier');
        home.click('@instructionsIdentifierCall')
            .api.pause(2000);
        home.click('@multipleEditSave').waitForElementVisible('@grid', 2000)
            .api.pause(2000);
        home.expect.element('@firstRowOfGridInstructions').to.have.text.that.contains('Call for pickup');
        home.expect.element('@secondRowOfGridInstructions').to.have.text.that.contains('Call for pickup');
        browser.end();
    }
};
