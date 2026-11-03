// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL é o endereço final (ex.: https://livros.seudominio.com.br).
// Configure como variável de ambiente na Vercel para gerar links absolutos nas prévias.
export default defineConfig({
  site: process.env.SITE_URL,
  build: { format: 'directory' },
});
