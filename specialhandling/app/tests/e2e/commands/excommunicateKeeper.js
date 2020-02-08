// Custom command to log into Django Admin and remove nightwatch user from group
// Assumes user is logged in
// See http://nightwatchjs.org/guide#writing-custom-commands

exports.command = function () {
    this.url('http://localhost:8000/admin/auth/user/')
        .pause(1000)
        .useXpath()
        .click('//a[text()="nightwatch"]')
        .pause(2000)
        .click('//option[contains(@title, "keepers_of_the_archive_of_kuali")]')
        .useCss()
        .click('#id_groups_remove_link')
        .useXpath()
        .click('//input[@type="submit" and @class="default"]')
        .useCss();
    return this;
};
