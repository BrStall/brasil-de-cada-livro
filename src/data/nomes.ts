// Nomes válidos de desenhos e enfeites. Cada nome corresponde a um arquivo .svg
// em src/assets/desenhos ou src/assets/enfeites. Ao criar um desenho novo,
// adicione o arquivo e o nome aqui.
export const DESENHOS = [
  'casario', 'cortico', 'engenho', 'esquina', 'estatua', 'igreja',
  'ilha', 'morro', 'relogio', 'sertao', 'sobrado', 'trem',
  'porto', 'araucaria', 'ponte', 'mina', 'ruina', 'viaduto', 'duna', 'lagoa', 'cadeia',
  'arcos', 'palmeira', 'azulejo', 'barra', 'carreta', 'salamanca',
] as const;

export const ENFEITES = ['barco', 'cacto', 'farol', 'pao', 'pinheiro', 'serra', 'sol'] as const;

export type NomeDesenho = (typeof DESENHOS)[number];
export type NomeEnfeite = (typeof ENFEITES)[number];
