import { getCollection } from 'astro:content';
import type { Lugar, Regiao } from '../types';

/** Estados em ordem de exibição. */
export async function regioesOrdenadas(): Promise<Regiao[]> {
  return (await getCollection('regioes')).sort((a, b) => a.data.ordem - b.data.ordem);
}

/** Lugares de um estado, na ordem cronológica definida no campo `ordem`. */
export async function lugaresDaRegiao(regiaoId: string): Promise<Lugar[]> {
  const todos = await getCollection('lugares', (l) => l.data.regiao.id === regiaoId);
  const ordenados = todos.sort((a, b) => a.data.ordem - b.data.ordem);
  const repetidos = ordenados.filter((l, i) => i > 0 && l.data.ordem === ordenados[i - 1].data.ordem);
  if (repetidos.length) {
    throw new Error(`Há lugares com a mesma "ordem" em ${regiaoId}: ${repetidos.map((l) => l.id).join(', ')}`);
  }
  return ordenados;
}

/** "rio/canto-dos-meirinhos" → { regiao: "rio", slug: "canto-dos-meirinhos" } */
export function partesDoId(lugar: Lugar): { regiao: string; slug: string } {
  const [regiao, ...resto] = lugar.id.split('/');
  const slug = resto.join('/');
  if (!slug || regiao !== lugar.data.regiao.id) {
    throw new Error(`O arquivo ${lugar.id} precisa estar na pasta da região "${lugar.data.regiao.id}"`);
  }
  return { regiao, slug };
}

export const hrefDoLugar = (lugar: Lugar): string => {
  const { regiao, slug } = partesDoId(lugar);
  return `/${regiao}/${slug}/`;
};
