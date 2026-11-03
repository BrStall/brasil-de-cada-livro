// Projeção simples (equirretangular corrigida pela latitude) e traço suave para o mapa ilustrado.
export type Ponto = [number, number]; // [lon, lat]
export type Caixa = [number, number, number, number]; // [oeste, sul, leste, norte]
export type ViewBox = [number, number, number, number];

export interface Projecao {
  x(lon: number): number;
  y(lat: number): number;
}

const ESCALA = 1000;

export function criarProjecao(base: Caixa, lat0: number): Projecao {
  const k = Math.cos((lat0 * Math.PI) / 180);
  return {
    x: (lon) => (lon - base[0]) * k * ESCALA,
    y: (lat) => (base[3] - lat) * ESCALA,
  };
}

/** Curva Catmull-Rom convertida em Bézier, para um contorno com cara de desenho à mão. */
export function suavizar(pontos: Ponto[], p: Projecao, fechado = true): string {
  const P = pontos.map(([lon, lat]) => [p.x(lon), p.y(lat)] as const);
  const n = P.length;
  if (n < 2) return '';
  const f = (v: number) => v.toFixed(2);
  let d = `M${f(P[0][0])},${f(P[0][1])}`;
  const ultimo = fechado ? n : n - 1;
  for (let i = 0; i < ultimo; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    const a0 = !fechado && i === 0 ? p1 : p0;
    const a3 = !fechado && i + 2 >= n ? p2 : p3;
    const c1x = p1[0] + (p2[0] - a0[0]) / 6, c1y = p1[1] + (p2[1] - a0[1]) / 6;
    const c2x = p2[0] - (a3[0] - p1[0]) / 6, c2y = p2[1] - (a3[1] - p1[1]) / 6;
    d += ` C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + (fechado ? ' Z' : '');
}

/** Converte uma caixa geográfica num viewBox com a mesma proporção da tela, centralizado. */
export function caixaParaViewBox(c: Caixa, p: Projecao, largura: number, altura: number): ViewBox {
  let x = p.x(c[0]), y = p.y(c[3]);
  let w = p.x(c[2]) - x, h = p.y(c[1]) - y;
  const proporcao = largura / altura;
  if (w / h < proporcao) {
    const nw = h * proporcao; x -= (nw - w) / 2; w = nw;
  } else {
    const nh = w / proporcao; y -= (nh - h) / 2; h = nh;
  }
  return [x, y, w, h];
}
