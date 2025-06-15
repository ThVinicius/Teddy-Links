import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  transformIgnorePatterns: ['/node_modules/(?!(nanoid)/)'],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.module.ts',
    '!**/*.entity.ts',
    '!**/main.ts',
    '!**/*.interface.ts',
    '!**/*.dto.ts',
    '!**/*.docs.ts',
    '!**/*.constant.ts',
    '!**/errors/*.ts',
    '!**/database/**/*.ts'
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node'
};

export default config;
