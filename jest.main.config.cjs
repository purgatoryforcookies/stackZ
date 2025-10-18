module.exports = {
    transform: {
        '^.+\\.ts?$': 'ts-jest',
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.node.json', useESM: true }]
    },
    roots: ['<rootDir>/src/main'],
    testRegex: '((\\.|/)(test))\\.(js|ts)?$',
    testEnvironment: 'node',
    watchPathIgnorePatterns: ['src/main/tests/fixtures'],
    moduleNameMapper: { '^@t$': '<rootDir>/src/types', '(.+)\\.js': '$1' },
    extensionsToTreatAsEsm: ['.ts']
}
