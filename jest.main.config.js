module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    },
    testRegex: '((\\.|/)(test))\\.(js|ts)?$',
    testEnvironment: 'node',
    watchPathIgnorePatterns: ['src/main/tests/fixtures'],
    moduleNameMapper: {
        '^@t$': '<rootDir>/src/types'
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'tsconfig.node.json'
        }]
    },
}
