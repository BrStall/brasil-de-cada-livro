import type { CollectionEntry } from 'astro:content';
import type { Ponto, Caixa } from './lib/geo';

export type Regiao = CollectionEntry<'regioes'>;
export type Lugar = CollectionEntry<'lugares'>;

/** Dados que a página entrega ao script do mapa no navegador. */
export interface DadosMapa {
  regiao: {
    lat0: number;
    chao: 'mata' | 'sertao';
    vistaPadrao: string;
    vistas: Record<string, { rotulo: string; caixa: Caixa }>;
    agua: Ponto[];
    ilhas: Ponto[][];
    lagos: Ponto[][];
    rios: Ponto[][];
    enfeites: { tipo: string; lon: number; lat: number; escala: number; somenteVista?: string }[];
    rotulos: { texto: string; lon: number; lat: number; tamanho: number; agua: boolean; somenteVista?: string }[];
    agrupamentos: { id: string; rotulo: string; lon: number; lat: number; vista: string; dx: number; dy: number; cor: string }[];
  };
  lugares: {
    id: string;
    href: string;
    n: number;
    lugar: string;
    livro: string;
    cor: string;
    corTexto: string;
    desenho: string;
    lon: number;
    lat: number;
    agrupamento?: string;
    aproximado: boolean;
  }[];
  atual: string | null;
  vista: string;
}
