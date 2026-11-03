// Mapa ilustrado interativo: desenha a região, troca de vista (zoom) e põe os desenhos dos lugares.
import { desenho, enfeite } from '../lib/desenhos';
import { caixaParaViewBox, criarProjecao, suavizar, type ViewBox } from '../lib/geo';
import type { DadosMapa } from '../types';

const NS = 'http://www.w3.org/2000/svg';
const TINTA = '#1E1A3A';
const BRANCO = '#FFFFFF';
const MAR = '#3CC3D6';
const MATA = '#9ED38A';
export const CHAVE_ROLAR = 'bdcl:rolar-para-ficha';

type Attrs = Record<string, string | number>;
function el<K extends keyof SVGElementTagNameMap>(nome: K, attrs: Attrs = {}, pai?: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, nome);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (pai) pai.appendChild(e);
  return e;
}

const aoTeclar = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
};

export function iniciarMapa(): void {
  const raiz = document.querySelector<HTMLElement>('[data-mapa]');
  const fonte = document.getElementById('mapa-dados');
  if (!raiz || !fonte?.textContent) return;

  const dados = JSON.parse(fonte.textContent) as DadosMapa;
  const R = dados.regiao;
  const svg = raiz.querySelector<SVGSVGElement>('svg.mapa')!;
  const chips = raiz.querySelector<HTMLElement>('[data-chips]')!;
  const proj = criarProjecao(R.vistas[R.vistaPadrao].caixa, R.lat0);

  let vista = dados.vista in R.vistas ? dados.vista : R.vistaPadrao;
  let vb: ViewBox = [0, 0, 1, 1];
  let animacao = 0;

  // ---------- Base: chão, água, ilhas, rios ----------
  svg.textContent = '';
  const defs = el('defs', {}, svg);
  const ondas = el('pattern', { id: 'ondas', patternUnits: 'userSpaceOnUse', width: 28, height: 16 }, defs);
  el('path', { d: 'M3 10 q4 -5 8 0 t8 0', fill: 'none', stroke: BRANCO, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.7 }, ondas);
  const grad = el('linearGradient', { id: 'chao-sertao', gradientUnits: 'userSpaceOnUse', x1: 0, x2: 0, y1: proj.y(-10.2), y2: proj.y(-12.4) }, defs);
  el('stop', { offset: 0, 'stop-color': '#F2BE5C' }, grad);
  el('stop', { offset: 0.55, 'stop-color': '#E9CF6A' }, grad);
  el('stop', { offset: 1, 'stop-color': MATA }, grad);

  el('rect', { x: -1e5, y: -1e5, width: 2e5, height: 2e5, fill: R.chao === 'sertao' ? 'url(#chao-sertao)' : MATA }, svg);
  const base = el('g', {}, svg);
  const contorno = { stroke: TINTA, 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' };
  const dAgua = suavizar(R.agua, proj);
  el('path', { d: dAgua, fill: MAR }, base);
  el('path', { d: dAgua, fill: 'url(#ondas)' }, base);
  el('path', { d: dAgua, fill: 'none', ...contorno }, base);
  R.ilhas.forEach((i) => el('path', { d: suavizar(i, proj), fill: MATA, ...contorno }, base));
  R.lagos.forEach((l) => el('path', { d: suavizar(l, proj), fill: MAR, ...contorno }, base));
  R.rios.forEach((r) => el('path', { d: suavizar(r, proj, false), fill: 'none', stroke: '#1C9BB0', 'stroke-width': 3, 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' }, base));

  const camadaEnfeites = el('g', { 'aria-hidden': 'true' }, svg);
  const camadaRotulos = el('g', { 'aria-hidden': 'true' }, svg);
  const camadaLugares = el('g', {}, svg);

  const escala = () => vb[2] / (svg.clientWidth || 400);

  // ---------- Camadas que dependem do zoom ----------
  function desenharCamadas(): void {
    const s = escala();
    const ampla = vista === R.vistaPadrao;
    const visivel = (somente?: string) => (somente ? somente === vista : ampla);
    ondas.setAttribute('patternTransform', `scale(${s})`);

    camadaEnfeites.textContent = '';
    for (const e of R.enfeites) {
      if (!visivel(e.somenteVista)) continue;
      const g = el('g', { transform: `translate(${proj.x(e.lon)},${proj.y(e.lat)}) scale(${s * e.escala})` }, camadaEnfeites);
      g.innerHTML = enfeite(e.tipo);
    }

    camadaRotulos.textContent = '';
    for (const r of R.rotulos) {
      if (!visivel(r.somenteVista)) continue;
      const t = el('text', {
        x: proj.x(r.lon), y: proj.y(r.lat), 'text-anchor': 'middle',
        class: r.agua ? 'rotulo agua' : 'rotulo', 'font-size': (r.tamanho * s).toFixed(5),
      }, camadaRotulos);
      if (!r.agua) t.style.strokeWidth = `${3 * s}px`;
      t.textContent = r.texto;
    }

    camadaLugares.textContent = '';
    if (ampla) {
      for (const a of R.agrupamentos) {
        const dentro = dados.lugares.filter((l) => l.agrupamento === a.id);
        if (!dentro.length) continue;
        const cx = proj.x(a.lon), cy = proj.y(a.lat);
        const g = el('g', { class: 'agrupamento', tabindex: 0, role: 'button', 'aria-label': `Ampliar ${a.rotulo}: ${dentro.length} lugares` }, camadaLugares);
        const tx = cx + a.dx * s, ty = cy + a.dy * s;
        const texto = `${a.rotulo}: ${dentro.length} lugares`;
        const w = (texto.length * 7.4 + 30) * s, h = 32 * s;
        el('path', { d: `M${cx} ${cy} L${tx} ${ty}`, stroke: TINTA, 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }, g);
        for (const l of dentro) {
          el('circle', { cx: proj.x(l.lon), cy: proj.y(l.lat), r: 6 * s, fill: l.cor, stroke: TINTA, 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }, g);
        }
        el('rect', { x: tx - w / 2 + 3 * s, y: ty - h / 2 + 3 * s, width: w, height: h, rx: h / 2, fill: TINTA }, g);
        el('rect', { x: tx - w / 2, y: ty - h / 2, width: w, height: h, rx: h / 2, fill: a.cor, stroke: TINTA, 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }, g);
        const t = el('text', { x: tx, y: ty + 0.5 * s, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': (12.5 * s).toFixed(5), fill: BRANCO, class: 'agrupamento-texto' }, g);
        t.textContent = `${texto} ＋`;
        const ir = () => mudarVista(a.vista);
        g.addEventListener('click', ir);
        g.addEventListener('keydown', aoTeclar(ir));
      }
    }

    for (const l of dados.lugares) {
      if (ampla === Boolean(l.agrupamento)) continue;
      const atual = l.id === dados.atual;
      const k = atual ? 1.3 : 1;
      const a = el('a', {
        href: l.href, class: 'lugar', 'aria-label': `${l.n}. ${l.lugar}, ${l.livro}`,
        transform: `translate(${proj.x(l.lon)},${proj.y(l.lat)}) scale(${s * k})`,
      }, camadaLugares);
      if (atual) a.setAttribute('aria-current', 'page');
      let h = '';
      h += l.aproximado
        ? `<ellipse cx="0" cy="0" rx="34" ry="12" fill="${BRANCO}" fill-opacity=".55" stroke="${TINTA}" stroke-width="1.5" stroke-dasharray="4 3"/>`
        : `<ellipse cx="0" cy="1" rx="22" ry="5" fill="${TINTA}" fill-opacity=".18"/>`;
      h += atual
        ? `<circle class="aro" cx="0" cy="-22" r="34" fill="${l.cor}" fill-opacity=".28" stroke="${l.cor}" stroke-width="3"/>`
        : `<circle class="aro" cx="0" cy="-22" r="30" fill="none"/>`;
      h += desenho(l.desenho);
      h += `<g transform="translate(20,-48)"><circle r="10" fill="${l.cor}" stroke="${TINTA}" stroke-width="2"/><text y="1" text-anchor="middle" dominant-baseline="central" class="numero" fill="${l.corTexto}">${l.n}</text></g>`;
      h += `<rect x="-30" y="-58" width="60" height="62" fill="transparent"/>`;
      a.innerHTML = h;
      a.addEventListener('click', () => {
        try { sessionStorage.setItem(CHAVE_ROLAR, '1'); } catch { /* sem armazenamento: tudo bem */ }
      });
    }
  }

  function aplicarViewBox(v: ViewBox): void {
    vb = v;
    svg.setAttribute('viewBox', v.map((n) => n.toFixed(4)).join(' '));
  }

  function alvo(): ViewBox {
    return caixaParaViewBox(R.vistas[vista].caixa, proj, svg.clientWidth || 400, svg.clientHeight || 600);
  }

  function mudarVista(nova: string, instantaneo = false): void {
    vista = nova;
    desenharChips();
    const destino = alvo();
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    cancelAnimationFrame(animacao);
    if (instantaneo || reduzir) { aplicarViewBox(destino); desenharCamadas(); return; }
    const de = vb.slice() as ViewBox, t0 = performance.now();
    const passo = (agora: number) => {
      const k = Math.min(1, (agora - t0) / 560), e = 1 - Math.pow(1 - k, 3);
      aplicarViewBox(de.map((v, i) => v + (destino[i] - v) * e) as ViewBox);
      desenharCamadas();
      if (k < 1) animacao = requestAnimationFrame(passo);
    };
    animacao = requestAnimationFrame(passo);
  }

  function desenharChips(): void {
    chips.textContent = '';
    for (const [id, v] of Object.entries(R.vistas)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = v.rotulo;
      b.setAttribute('aria-pressed', String(id === vista));
      b.addEventListener('click', () => mudarVista(id));
      chips.appendChild(b);
    }
  }

  desenharChips();
  mudarVista(vista, true);

  let espera = 0;
  window.addEventListener('resize', () => {
    clearTimeout(espera);
    espera = window.setTimeout(() => mudarVista(vista, true), 80);
  });
}

/** No celular, depois de tocar num desenho do mapa, a nova página já abre na ficha. */
export function rolarParaFichaSePreciso(): void {
  let pedir = false;
  try { pedir = sessionStorage.getItem(CHAVE_ROLAR) === '1'; sessionStorage.removeItem(CHAVE_ROLAR); } catch { /* ignora */ }
  if (pedir && window.innerWidth < 900) document.getElementById('ficha')?.scrollIntoView({ block: 'start' });
}
