# O Brasil de cada livro

Mapa afetivo e ilustrado de clássicos brasileiros em domínio público. Cada lugar mostra o trecho do livro, como o lugar era, como está hoje e uma pergunta para a sala de aula.

Feito com [Astro](https://astro.build): páginas estáticas, rápidas no celular, com JavaScript só no mapa.

## Rodar no computador

Precisa do Node 20 ou mais novo.

```bash
npm install
npm run dev      # abre em http://localhost:4321
npm run check    # confere tipos e o conteúdo
npm run build    # gera o site em dist/
```

## Estrutura

```
src/
  content/
    regioes/        um .json por estado: geometria do mapa, vistas (zoom), rótulos, enfeites
    lugares/
      rio/          um .md por lugar (o nome do arquivo vira o endereço: /rio/canto-dos-meirinhos/)
      bahia/
      parana/
  content.config.ts regras do conteúdo: se faltar um campo, o build avisa
  assets/
    desenhos/       um .svg por desenho de lugar (casario, trem, igreja...)
    enfeites/       desenhos decorativos do mapa (barco, cacto, sol...)
  components/       Topo, Trilha, Mapa, Ficha...
  pages/            início, página do estado e página de cada lugar
  scripts/mapa.ts   mapa interativo dos estados (vistas, desenhos, agrupamentos)
  scripts/mapa-brasil.ts  zoom do mapa do Brasil na página inicial
  data/             paleta de cores, nomes dos desenhos e brasil.json (contorno dos estados)
public/             favicon, manifest e service worker (leitura sem internet)
scripts/            gerar-brasil.mjs: refaz src/data/brasil.json (contorno dos estados, IBGE)
```

## Adicionar um lugar

1. Crie `src/content/lugares/<estado>/<nome-do-lugar>.md` copiando um arquivo existente.
2. Preencha os campos. Os principais:
   - `ordem`: posição na trilha (ordem cronológica de publicação). Não pode repetir no mesmo estado.
   - `coordenadas`: `{ lat, lon }` do lugar.
   - `desenho`: um dos nomes de `src/data/nomes.ts`.
   - `cor`: `azul`, `rosa`, `amarelo`, `verde`, `laranja`, `lilas`, `turquesa` ou `vermelho`.
   - `agrupamento` (opcional): coloca o lugar dentro de uma vista ampliada, como `centro` no Rio.
   - `aproximado: true` quando o local exato não é conhecido.
   - `poema: true` para manter as quebras de linha do trecho (use `\n` entre os versos).
3. O texto abaixo do cabeçalho (`---`) é opcional e aparece no fim da ficha: bom para notas do professor.
4. Rode `npm run check`. Se algo estiver errado, o erro diz qual arquivo e qual campo.

Use só autores mortos até 70 anos antes do ano atual (Lei 9.610/98, art. 41) e copie o trecho de edições em domínio público, nunca de edições comentadas modernas.

## Adicionar um estado

1. Crie `src/content/regioes/<estado>.json` a partir de um existente. As coordenadas são `[longitude, latitude]`.
   - `uf`: a sigla do estado (ex.: `MG`). Liga o estado ao mapa do Brasil da página inicial.
   - `placa` (opcional): onde fica a plaquinha no mapa do Brasil, `{ "lon": ..., "lat": ... }`. Para estado pequeno, ponha no mar: uma linha liga a plaquinha ao estado.
   - `vistas`: a primeira é a vista ampla; as outras são zooms (ex.: centro da cidade). `caixa` é `[oeste, sul, leste, norte]`.
   - `agua`: contorno do mar ou da baía. Os pontos são suavizados num traço de desenho.
2. Crie a pasta `src/content/lugares/<estado>/` com os lugares.
3. O estado aparece sozinho no início e nas abas.

## Desenhos

Cada desenho é um SVG com `viewBox="-34 -62 68 68"`: o pé do desenho fica em `0,0` e ele cresce para cima, até uns 60 de altura. Assim o desenho "pisa" na coordenada do lugar. Uma ilustradora pode substituir qualquer arquivo de `src/assets/desenhos/` mantendo essa convenção. Para um desenho novo, crie o arquivo e acrescente o nome em `src/data/nomes.ts`.

## Publicar na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Na Vercel, **Add New › Project** e importe o repositório. Ela reconhece o Astro sozinha.
3. Em **Settings › Environment Variables**, crie `SITE_URL` com o endereço final (ex.: `https://livros.seudominio.com.br`).
4. Em **Settings › Domains**, adicione o domínio.

Depois disso, cada push na `main` publica o site, e cada pull request ganha uma prévia.

## Próximos passos

- Estados: Minas Gerais, São Paulo, Ceará.
- Sugestões de lugares por alunos e professores, com moderação (ex.: Supabase).
- Editor de conteúdo sem código (ex.: Decap CMS) sobre os mesmos arquivos `.md`.
- Ilustrações profissionais no lugar dos desenhos atuais.
