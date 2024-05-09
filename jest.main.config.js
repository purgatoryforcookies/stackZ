module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest',
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.node.json'
            }
        ]
    },
    roots: ['<rootDir>/src/main'],
    testRegex: '((\\.|/)(test))\\.(js|ts)?$',
    testEnvironment: 'node',
    watchPathIgnorePatterns: ['src/main/tests/fixtures'],
    moduleNameMapper: {
        '^@t$': '<rootDir>/src/types'
    }
}
