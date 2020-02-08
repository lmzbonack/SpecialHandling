module.exports = {
    globals: {
        SENTRY_DSN: ""
    },
    rootDir: "../../../",
    moduleFileExtensions: [
        "js",
        "json",
        "vue"
    ],
    setupFiles: [
        "<rootDir>/app/tests/unit/testSetup.js"
    ],
    transform: {
        ".*\\.(vue)$": "<rootDir>/node_modules/vue-jest",
        ".*": "<rootDir>/node_modules/babel-jest"
    },
    transformIgnorePatterns: [
        "node_modules/(?!vueoom/src)"
    ],
    testMatch: [
        "**/unit/**/*.test.js"
    ],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/app/$1",
        "\\.(css|scss)$": "<rootDir>/app/tests/unit/__mocks__/styleMock.js",
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/app/tests/unit/__mocks__/fileMock.js"
    },
    snapshotSerializers: [
        "<rootDir>/node_modules/jest-serializer-vue"
    ],
    coveragePathIgnorePatterns: [
        "<rootDir>/app/tests/unit/__utils__",
        "/node_modules/"
    ],
    coverageReporters: [
        "text"
    ]
};
