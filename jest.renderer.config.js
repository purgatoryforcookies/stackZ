module.exports = {
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    roots: [
        "<rootDir>/src/renderer/src"
    ],
    testRegex: '((\\.|/)(test))\\.(jsx|tsx)?$',
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@t$': '<rootDir>/src/types',
        "^@renderer/(.*)": "<rootDir>/src/renderer/src/$1",
        "\\.(css)$": "<rootDir>/src/renderer/src/assets/styleMock.js"
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'tsconfig.web.json'
        }]
    },
}
