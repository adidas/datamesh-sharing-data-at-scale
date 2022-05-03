/* eslint-disable no-undef, @typescript-eslint/no-unsafe-assignment */
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  ...require('build-tools-jest'),
  ...require('build-tools-typescript-jest'),
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: [ '<rootDir>/test/specs/**/*.spec.ts' ],
  coveragePathIgnorePatterns: [ '<rootDir>/test/config' ],
  collectCoverage: false,
  collectCoverageFrom: [ '<rootDir>/cdk/**/*.{ts,js}' ],
  coverageReporters: [[ 'lcov', { projectRoot: '.' }]],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/test/config/tsconfig.json'
    }
  }
};
