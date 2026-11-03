import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CORES } from './data/paleta';
import { DESENHOS, ENFEITES } from './data/nomes';

const ponto = z.tuple([z.number(), z.number()]); // [longitude, latitude]
const caixa = z.tuple([z.number(), z.number(), z.number(), z.number()]); // [oeste, sul, leste, norte]

const regioes = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/regioes' }),
  schema: z
    .object({
      nome: z.string(),
      ordem: z.number().int(),
      cor: z.enum(CORES),
      descricao: z.string(),
      lat0: z.number(),
      chao: z.enum(['mata', 'sertao']),
      vistaPadrao: z.string(),
      vistas: z.record(z.object({ rotulo: z.string(), caixa })),
      agua: z.array(ponto).min(3),
      ilhas: z.array(z.array(ponto)).default([]),
      lagos: z.array(z.array(ponto)).default([]),
      rios: z.array(z.array(ponto)).default([]),
      enfeites: z
        .array(
          z.object({
            tipo: z.enum(ENFEITES),
            lon: z.number(),
            lat: z.number(),
            escala: z.number().default(1),
            somenteVista: z.string().optional(),
          }),
        )
        .default([]),
      rotulos: z
        .array(
          z.object({
            texto: z.string(),
            lon: z.number(),
            lat: z.number(),
            tamanho: z.number(),
            agua: z.boolean().default(false),
            somenteVista: z.string().optional(),
          }),
        )
        .default([]),
      agrupamentos: z
        .array(
          z.object({
            id: z.string(),
            rotulo: z.string(),
            lon: z.number(),
            lat: z.number(),
            vista: z.string(),
            dx: z.number(),
            dy: z.number(),
            cor: z.enum(CORES),
          }),
        )
        .default([]),
    })
    .superRefine((r, ctx) => {
      if (!(r.vistaPadrao in r.vistas)) {
        ctx.addIssue({ code: 'custom', message: `vistaPadrao "${r.vistaPadrao}" não existe em vistas` });
      }
      for (const a of r.agrupamentos) {
        if (!(a.vista in r.vistas)) {
          ctx.addIssue({ code: 'custom', message: `agrupamento "${a.id}" aponta para a vista "${a.vista}", que não existe` });
        }
      }
    }),
});

const lugares = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lugares' }),
  schema: z.object({
    regiao: reference('regioes'),
    ordem: z.number().int().positive(),
    lugar: z.string().min(1),
    onde: z.string().min(1),
    livro: z.string().min(1),
    autor: z.string().min(1),
    ano: z.string().min(1),
    coordenadas: z.object({
      lat: z.number().min(-34).max(6),
      lon: z.number().min(-74).max(-28),
    }),
    aproximado: z.boolean().default(false),
    desenho: z.enum(DESENHOS),
    cor: z.enum(CORES),
    agrupamento: z.string().optional(),
    poema: z.boolean().default(false),
    trecho: z.string().min(1),
    notaTrecho: z.string().min(1),
    entao: z.string().min(1),
    hoje: z.string().min(1),
    pergunta: z.string().min(1),
  }),
});

export const collections = { regioes, lugares };
