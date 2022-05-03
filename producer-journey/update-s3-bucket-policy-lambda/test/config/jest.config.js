module.exports = {
  ...require('../../../../jest.default-config'),
  rootDir: '../..',
  setupFiles: [ '<rootDir>/test/config/set-environmental-variables.js' ],
  collectCoverageFrom: [ '<rootDir>/src/**/*.{ts,js}' ]
};
