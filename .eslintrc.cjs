module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        '@electron-toolkit/eslint-config-ts/recommended',
        '@electron-toolkit/eslint-config-prettier'
    ],
    overrides: [
        {
            files: ['*.ts', '*.mts', '*.cts', '*.tsx'],
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'off',
                'react/prop-types': 'off',
                'react/no-unknown-property': 'off',
                '@typescript-eslint/no-empty-function': 'off',
                'no-control-regex': 'off',
                'no-unused-vars': 'off',
                '@typescript-eslint/no-unused-vars': [
                    'error',
                    {
                        argsIgnorePattern: '^_',
                        varsIgnorePattern: '^_',
                        caughtErrorsIgnorePattern: '^_'
                    }
                ]
            }
        },
        {
            files: ['*.test.tsx'],
            rules: {
                'jest/expect-expect': 'off'
            }
        }
    ],
    settings: {
        react: {
            version: 'detect'
        }
    }
}
