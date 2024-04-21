module.exports = {
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.web.json'
            }
        ]
    },
    roots: ['<rootDir>/src/renderer/src'],
    testRegex: '((\\.|/)(test))\\.(jsx|tsx)?$',
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@t$': '<rootDir>/src/types',
        '^@renderer/(.*)': '<rootDir>/src/renderer/src/$1',
        "\\.(s?css|less)$": "identity-obj-proxy"
    }
}
