module.exports = {
    'the Home page loads initially': function (browser) {
        browser
            .url('http://localhost:8000/')
            .waitForElementVisible('body', 1000)
            .assert.urlContains('/#/home')
            .end();
    },
    'can navigate to the Signed Checks page': function (browser) {
        browser
            .url('http://localhost:8000/')
            .waitForElementVisible('#home.nav-item .nav-link', 1000)
            .click('#signed-checks.nav-item .nav-link')
            .waitForElementVisible('body', 1000)
            .assert.urlContains('/#/signed-checks')
            .end();
    },
    'can navigate to the Signatures page': function (browser) {
        browser
            .url('http://localhost:8000/')
            .waitForElementVisible('#home.nav-item .nav-link', 1000)
            .click('#signatures.nav-item .nav-link')
            .waitForElementVisible('body', 1000)
            .assert.urlContains('/#/signatures')
            .end();
    }
};
