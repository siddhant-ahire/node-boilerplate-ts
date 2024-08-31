const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');
process.env.NODE_ENV='development';
require('dotenv').config({ path: '.env.test' });

module.exports = {
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }),
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    testMatch: ['**/src/**/*.test.ts'], // Match test files in the src directory
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  };