import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import tailwindPlugin from './plugins/tailwind-plugin.cjs';

const config: Config = {
  title: 'StackZ',
  tagline: 'Little helper for your environment setups.',
  favicon: 'img/favicon.ico',
  plugins: [tailwindPlugin],
  url: 'https://github.com',
  baseUrl: '/stackZ/',
  trailingSlash: false,
  organizationName: 'purgatoryforcookies',
  projectName: 'stackZ',
  deploymentBranch: 'master',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
    },
    navbar: {
      title: 'StackZ',
      logo: {
        alt: 'Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/purgatoryforcookies/stackZ',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',

    },

  } satisfies Preset.ThemeConfig,
};

export default config;
