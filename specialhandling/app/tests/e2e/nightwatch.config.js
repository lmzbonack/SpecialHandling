module.exports = {
    src_folders: ['app/tests/e2e/specs'],
    output_folder: 'app/tests/e2e/reports',
    globals_path: 'app/tests/e2e/globalsConfig.js',
    custom_commands_path: 'app/tests/e2e/commands',
    page_objects_path: 'app/tests/e2e/objects',
    selenium: {
        start_process: false
    },
    test_settings: {
        default: {
            selenium_port: 9515,
            selenium_host: "localhost",
            default_path_prefix: "",

            desiredCapabilities: {
                browserName: "chrome",
                chromeOptions: {
                    args: ["--no-sandbox"],
                },
                acceptSslCerts: true
            }
        }
    }
};
