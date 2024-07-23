/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],

    content: {
        relative: true,
        files: ['./**/*.html', './src/renderer/src/**/*.tsx']
    },
    prefix: '',
    theme: {
        fontFamily: {
            code: ['Inconsolata']
        },
        screens: {
            sm: '500px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px'
        },
        container: {
            center: true
        },
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                terminalHeader: 'hsl(0, 0%, 4%)',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                }
            },
            backgroundImage: {
                gradient: 'var(--gradient)'
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                border: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '90% 50%' }
                },
                'border-left-to-right': {
                    '0%': { left: '-96%' },
                    '50%': { left: '96%' },
                    '100%': { left: '-96%' },
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                border: 'border 5s ease-in infinite',
                'border-linear': 'border-left-to-right 3s ease-in-out infinite'


            },
            transitionProperty: {
                height: 'height',
                width: 'width',
                opacity: 'opacity'
            }
        }
    },
    plugins: [require('tailwindcss-animate')]
}
