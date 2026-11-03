// Carrega os desenhos (src/assets/desenhos) e enfeites (src/assets/enfeites) como texto SVG.
// Cada arquivo usa a convenção: o "pé" do desenho fica no ponto 0,0, e ele cresce para cima
// (viewBox -34 -62 68 68). Assim o desenho "pisa" exatamente na coordenada do lugar.
const desenhosRaw = import.meta.glob('../assets/desenhos/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const enfeitesRaw = import.meta.glob('../assets/enfeites/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Conteúdo interno de um arquivo SVG, sem a tag <svg> em volta. */
const miolo = (svg: string): string =>
  svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();

const porNome = (arquivos: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(arquivos).map(([caminho, svg]) => [
      caminho.split('/').pop()!.replace(/\.svg$/, ''),
      miolo(svg),
    ]),
  );

export const DESENHO_SVG = porNome(desenhosRaw);
export const ENFEITE_SVG = porNome(enfeitesRaw);

export const desenho = (nome: string): string => DESENHO_SVG[nome] ?? '';
export const enfeite = (nome: string): string => ENFEITE_SVG[nome] ?? '';
