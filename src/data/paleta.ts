// Cores do casario do Pelourinho. Os nomes são usados no conteúdo (campo `cor`).
export const PALETA = {
  azul: '#2F6BE0',
  rosa: '#F0508C',
  amarelo: '#F6B800',
  verde: '#2FA85A',
  laranja: '#FF7A2F',
  lilas: '#8C5BD1',
  turquesa: '#18B3A6',
  vermelho: '#E53935',
} as const;

export type Cor = keyof typeof PALETA;
export const CORES = Object.keys(PALETA) as [Cor, ...Cor[]];

export const TINTA = '#1E1A3A';
export const BRANCO = '#FFFFFF';

/** Cor do texto que fica legível sobre cada cor da paleta. */
export const corTexto = (cor: Cor): string => (cor === 'amarelo' ? TINTA : BRANCO);
