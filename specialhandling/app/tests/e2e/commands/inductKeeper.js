// Custom command to log into Django Admin and add nightwatch user to group
// See http://nightwatchjs.org/guide#writing-custom-commands

exports.command = function (username, password) {
    this.url('http://localhost:8000/admin/')
        .waitForElementVisible('#id_username', 1000)
        .setValue('#id_username', username)
        .setValue('#id_password', password)
        .click('input[type=submit]')
        .waitForElementVisible('#header', 1000)
        .url('http://localhost:8000/admin/auth/user/')
        .pause(1000)
        .useXpath()
        .click('//a[text()="nightwatch"]')
        .pause(2000)
        .click('//option[contains(@title, "keepers_of_the_archive_of_kuali")]')
        .useCss()
        .click('#id_groups_add_link')
        .useXpath()
        .click('//input[@type="submit" and @class="default"]')
        .useCss();
    return this;
};
