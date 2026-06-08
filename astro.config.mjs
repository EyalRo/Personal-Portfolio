import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://isdino.com',
  integrations: [tailwind({
    applyBaseStyles: false,
  })],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
