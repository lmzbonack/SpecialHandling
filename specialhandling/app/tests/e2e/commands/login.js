// Custom command to log into Django Admin
// See http://nightwatchjs.org/guide#writing-custom-commands

exports.command = function (username, password) {
    this.url('http://localhost:8000/admin/')
        .useCss()
        .waitForElementVisible('#id_username', 1000)
        .setValue('#id_username', username)
        .setValue('#id_password', password)
        .click('input[type=submit]')
        .waitForElementVisible('#header', 1000); 
    return this;
};
