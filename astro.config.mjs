// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://edl-tech.github.io/aevum-agora',
  base: '/aevum-agora',
  integrations: [mdx(), sitemap()],
});
