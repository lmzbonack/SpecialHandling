var chromedriver = require('chromedriver');

module.exports = {
    before: function (done) {
        // Whitelist all ips so that tests run fine in CI
        let args = [
            "--whitelist-ips=''"
        ];
        chromedriver.start(args);
        done();
    },
    after: function (done) {
        chromedriver.stop();
        done();
    }
};  

