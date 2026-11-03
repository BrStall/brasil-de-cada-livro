// Gera src/data/brasil.json: o contorno simplificado de cada estado, para o mapa da página inicial.
// Fonte: malha de estados do IBGE (dado público). A simplificação usa o mapshaper, que mantém
// as divisas encaixadas entre estados vizinhos. Só precisa rodar de novo se quiser mudar o detalhe.
//
//   node scripts/gerar-brasil.mjs
import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DETALHE = '6%';
const MALHA = 'https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo%2Bjson&qualidade=intermediaria&intrarregiao=UF';
const ESTADOS = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';

const malha = await (await fetch(MALHA)).json();
const estados = await (await fetch(ESTADOS)).json();
const porCodigo = Object.fromEntries(estados.map((e) => [String(e.id), e]));
for (const f of malha.features) {
  const e = porCodigo[f.properties.codarea];
  f.properties = { uf: e.sigla, nome: e.nome };
}

const pasta = mkdtempSync(join(tmpdir(), 'brasil-'));
const entrada = join(pasta, 'ufs.json');
const saida = join(pasta, 'ufs-simples.json');
writeFileSync(entrada, JSON.stringify(malha));
execSync(`npx -y mapshaper@0.6.102 "${entrada}" -simplify ${DETALHE} keep-shapes ` +
  `-filter-islands min-area=300km2 -o precision=0.01 format=geojson "${saida}"`, { stdio: 'inherit' });

const simples = JSON.parse(readFileSync(saida, 'utf8'));
const ufs = simples.features
  .map((f) => ({
    uf: f.properties.uf,
    nome: f.properties.nome,
    // Lista de anéis [lon, lat]. Furos (como o DF dentro de Goiás) vêm como anéis comuns
    // e são recortados com fill-rule="evenodd".
    aneis: f.geometry.type === 'Polygon' ? f.geometry.coordinates : f.geometry.coordinates.flat(),
  }))
  .sort((a, b) => a.uf.localeCompare(b.uf));

writeFileSync('src/data/brasil.json', JSON.stringify(ufs) + '\n');
console.log(`src/data/brasil.json: ${ufs.length} estados`);
