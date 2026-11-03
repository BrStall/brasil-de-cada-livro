// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL é o endereço final (ex.: https://livros.seudominio.com.br).
// Configure como variável de ambiente na Vercel para gerar links absolutos nas prévias.
// Sem SITE_URL, usa o domínio de produção que a própria Vercel informa no build.
// Aceita o endereço sem "https://" e ignora espaços.
function enderecoDoSite() {
  const valor = (process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '').trim();
  if (!valor) return undefined;
  return /^https?:\/\//.test(valor) ? valor : `https://${valor}`;
}

export default defineConfig({
  site: enderecoDoSite(),
  build: { format: 'directory' },
});
