// Zoom do mapa do Brasil da página inicial: botões, pinça com dois dedos, Ctrl + roda do mouse
// (ou pinça no trackpad) e arrastar quando ampliado. As plaquinhas mantêm o tamanho na tela.
type Caixa = [number, number, number, number]; // x, y, largura, altura (unidades do SVG)

const ZOOM_MAX = 8;
const ARRASTO_MIN = 6; // px: abaixo disso ainda conta como toque/clique

export function iniciarMapaBrasil(): void {
  const raiz = document.querySelector<HTMLElement>('[data-brasil]');
  if (!raiz) return;
  const palco = raiz.querySelector<HTMLElement>('[data-palco]')!;
  const svg = palco.querySelector<SVGSVGElement>('svg')!;
  const W = Number(svg.dataset.largura), H = Number(svg.dataset.altura);
  const placas = [...palco.querySelectorAll<HTMLElement>('.placas li')];
  const padroes = [...svg.querySelectorAll<SVGPatternElement>('pattern[data-escala]')];
  const sombra = svg.querySelector<SVGGElement>('[data-sombra]')!;
  const ligacoes = [...svg.querySelectorAll<SVGGElement>('.br-ligacao')].map((g) => ({
    ax: Number(g.dataset.ax), ay: Number(g.dataset.ay),
    linha: g.querySelector('path')!, ponto: g.querySelector('circle')!,
  }));
  const botao = (z: string) => raiz.querySelector<HTMLButtonElement>(`[data-zoom="${z}"]`)!;
  const [mais, menos, tudo] = [botao('mais'), botao('menos'), botao('tudo')];

  let vb: Caixa = [0, 0, W, H];
  let animacao = 0;
  let arrastou = false;

  function limitar([x, y, w]: Caixa): Caixa {
    w = Math.min(W, Math.max(W / ZOOM_MAX, w));
    const h = (w * H) / W;
    return [Math.min(W - w, Math.max(0, x)), Math.min(H - h, Math.max(0, y)), w, h];
  }

  function aplicar(v: Caixa): void {
    vb = limitar(v);
    const [x, y, w, h] = vb;
    svg.setAttribute('viewBox', `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
    const s = w / (palco.clientWidth || 400);
    for (const p of padroes) p.setAttribute('patternTransform', `scale(${s}) ${p.dataset.escala ?? ''}`);
    sombra.setAttribute('transform', `translate(${4 * s} ${4 * s})`);
    // A plaquinha fica no seu lugar (no mar, com a linha) se ele couber na tela. Se não couber,
    // vai para cima do estado; se nem o estado aparece, some.
    const largura = palco.clientWidth, altura = palco.clientHeight;
    const naTela = (mx: number, my: number, mw: number, mh: number) => {
      const sx = ((mx - x) / w) * largura, sy = ((my - y) / h) * altura;
      return sx >= mw && sx <= largura - mw && sy >= mh && sy <= altura - mh ? [sx, sy] : null;
    };
    placas.forEach((li, i) => {
      const l = ligacoes[i];
      const mw = li.offsetWidth / 2 + 4, mh = li.offsetHeight / 2 + 4;
      const noMar = naTela(Number(li.dataset.px), Number(li.dataset.py), mw, mh);
      const pos = noMar ?? naTela(l.ax, l.ay, 0, 0);
      li.hidden = !pos;
      l.linha.style.display = l.ponto.style.display = noMar ? '' : 'none';
      if (!pos) return;
      li.style.left = `${Math.min(largura - mw, Math.max(mw, pos[0]))}px`;
      li.style.top = `${Math.min(altura - mh, Math.max(mh, pos[1]))}px`;
      l.ponto.setAttribute('r', String(5 * s));
    });
    const inteiro = w >= W * 0.999;
    palco.classList.toggle('ampliado', !inteiro);
    tudo.hidden = inteiro;
    menos.disabled = inteiro;
    mais.disabled = w <= (W / ZOOM_MAX) * 1.001;
  }

  /** Ponto da tela em unidades do SVG. */
  function noMapa(cx: number, cy: number, base: Caixa = vb): [number, number] {
    const r = svg.getBoundingClientRect();
    return [base[0] + ((cx - r.left) / r.width) * base[2], base[1] + ((cy - r.top) / r.height) * base[3]];
  }

  /** Amplia (fator > 1) ou afasta mantendo o ponto [mx, my] do mapa parado na tela. */
  function ampliado(fator: number, mx: number, my: number, base: Caixa = vb): Caixa {
    const w = Math.min(W, Math.max(W / ZOOM_MAX, base[2] / fator));
    const k = w / base[2];
    return [mx - (mx - base[0]) * k, my - (my - base[1]) * k, w, (w * H) / W];
  }

  function animarPara(destino: Caixa): void {
    cancelAnimationFrame(animacao);
    const alvo = limitar(destino);
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { aplicar(alvo); return; }
    const de = vb.slice() as Caixa, t0 = performance.now();
    const passo = (agora: number) => {
      const k = Math.min(1, (agora - t0) / 320), e = 1 - Math.pow(1 - k, 3);
      aplicar(de.map((v, i) => v + (alvo[i] - v) * e) as Caixa);
      if (k < 1) animacao = requestAnimationFrame(passo);
    };
    animacao = requestAnimationFrame(passo);
  }

  const meio = (): [number, number] => [vb[0] + vb[2] / 2, vb[1] + vb[3] / 2];
  mais.addEventListener('click', () => animarPara(ampliado(2, ...meio())));
  menos.addEventListener('click', () => animarPara(ampliado(0.5, ...meio())));
  tudo.addEventListener('click', () => animarPara([0, 0, W, H]));

  // Ctrl + roda (no trackpad, a pinça chega assim). A roda sozinha continua rolando a página.
  palco.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    cancelAnimationFrame(animacao);
    aplicar(ampliado(Math.exp(-e.deltaY * 0.01), ...noMapa(e.clientX, e.clientY)));
  }, { passive: false });

  // Mouse: arrastar quando ampliado.
  let mouse: { x: number; y: number; base: Caixa } | null = null;
  palco.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || vb[2] >= W * 0.999) return;
    arrastou = false;
    mouse = { x: e.clientX, y: e.clientY, base: vb.slice() as Caixa };
  });
  window.addEventListener('pointermove', (e) => {
    if (!mouse) return;
    const dx = e.clientX - mouse.x, dy = e.clientY - mouse.y;
    if (!arrastou && Math.hypot(dx, dy) < ARRASTO_MIN) return;
    arrastou = true;
    palco.classList.add('arrastando');
    const r = svg.getBoundingClientRect(), b = mouse.base;
    aplicar([b[0] - (dx / r.width) * b[2], b[1] - (dy / r.height) * b[3], b[2], b[3]]);
  });
  window.addEventListener('pointerup', () => { mouse = null; palco.classList.remove('arrastando'); });

  // Toque: pinça com dois dedos; com o mapa ampliado, um dedo arrasta.
  // No Brasil inteiro, um dedo continua rolando a página.
  let toque: { d: number; mx: number; my: number; cx: number; cy: number; base: Caixa } | null = null;
  const inicioToque = (t: TouchList) => {
    const a = t[0], b = t[1] ?? t[0];
    const cx = (a.clientX + b.clientX) / 2, cy = (a.clientY + b.clientY) / 2;
    const [mx, my] = noMapa(cx, cy);
    toque = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), mx, my, cx, cy, base: vb.slice() as Caixa };
  };
  palco.addEventListener('touchstart', (e) => {
    cancelAnimationFrame(animacao);
    arrastou = false;
    if (e.touches.length >= 2) e.preventDefault();
    inicioToque(e.touches);
  }, { passive: false });
  palco.addEventListener('touchmove', (e) => {
    if (!toque) return;
    const dois = e.touches.length >= 2;
    if (!dois && vb[2] >= W * 0.999) return;
    e.preventDefault();
    const a = e.touches[0], b = e.touches[1] ?? a;
    const cx = (a.clientX + b.clientX) / 2, cy = (a.clientY + b.clientY) / 2;
    if (!arrastou && Math.hypot(cx - toque.cx, cy - toque.cy) < ARRASTO_MIN && !dois) return;
    arrastou = true;
    const fator = dois && toque.d > 0 ? Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / toque.d : 1;
    const z = ampliado(fator, toque.mx, toque.my, toque.base);
    const r = svg.getBoundingClientRect();
    aplicar([toque.mx - ((cx - r.left) / r.width) * z[2], toque.my - ((cy - r.top) / r.height) * z[3], z[2], z[3]]);
  }, { passive: false });
  palco.addEventListener('touchend', (e) => { toque = null; if (e.touches.length) inicioToque(e.touches); });

  // Depois de arrastar, soltar o dedo em cima de um estado não abre a página dele.
  palco.addEventListener('click', (e) => {
    if (arrastou) { e.preventDefault(); e.stopPropagation(); arrastou = false; }
  }, true);

  let espera = 0;
  window.addEventListener('resize', () => { clearTimeout(espera); espera = window.setTimeout(() => aplicar(vb), 80); });
  aplicar(vb);
}
