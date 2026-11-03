# O Brasil de cada livro — contexto do projeto

Mapa afetivo e ilustrado de clássicos brasileiros em domínio público: cada lugar real onde um livro acontece vira um desenho no mapa, com o trecho original, "Então" (como era), "Hoje" (como está) e uma pergunta para a sala de aula.

Projeto pessoal da Bruna, ligado à pós-graduação em tecnologias para educação. Público principal: alunos e professores, acessando **pelo celular** (celular primeiro, mas responsivo).

## Stack e comandos

- Astro 5 + TypeScript, site estático. JavaScript no navegador só nos mapas (`src/scripts/mapa.ts` nos estados, `src/scripts/mapa-brasil.ts` no zoom do início) e no service worker.
- Conteúdo em content collections: `src/content/lugares/<estado>/*.md` (frontmatter validado) e `src/content/regioes/<estado>.json` (geometria do mapa). Schema em `src/content.config.ts`.
- `npm run dev` · `npm run check` · `npm run build`
- Publicado: GitHub (`BrStall/brasil-de-cada-livro`) → Vercel. Cada push na `main` publica. `SITE_URL` aceita endereço sem `https://`; sem ela, usa o domínio da Vercel.
- O remoto usa `https://BrStall@github.com/...` porque o Windows também guarda o login de outra conta do GitHub.
- Detalhes de estrutura, como adicionar lugar/estado e convenção dos desenhos: ver `README.md`.

## Decisões de design (manter)

- Visual único, claro e bem colorido, inspirado no casario do Pelourinho (Bahia). Sem modo escuro, por escolha.
- Paleta em `src/data/paleta.ts`: azul, rosa, amarelo, verde, laranja, lilás, turquesa, vermelho; tinta `#1E1A3A`. Cada lugar tem uma cor.
- Fontes: Lilita One (títulos), Literata (trechos dos livros), Nunito Sans (interface).
- Estilo "desenho": contornos grossos escuros, sombras sólidas deslocadas (box-shadow 4–6px), cantos arredondados, topo com fileira de casarões e faixa tipo fitinha do Bonfim.
- No mapa, os lugares são **ilustrações** (casinhas, igreja, trem, mandacaru…), não pinos. Cada desenho conta algo do livro (ex.: relógio marcando 4h15 para o Major Quaresma; Morro do Castelo tracejado porque foi demolido; igreja afundada no açude em Canudos).
- Desenhos são SVGs em `src/assets/desenhos/` com `viewBox="-34 -62 68 68"` e o pé em `0,0`. Nomes válidos em `src/data/nomes.ts`.
- Mapas dos estados são **ilustrativos e fora de escala**: contornos de costa feitos à mão a partir de coordenadas aproximadas, suavizados (Catmull-Rom).
- Exceção: o mapa do Brasil da página inicial usa o contorno real dos estados (malha do IBGE, simplificada com mapshaper) em `src/data/brasil.json`, gerado por `node scripts/gerar-brasil.mjs`. Todos os estados são pintados com a paleta, sem repetir cor entre vizinhos; os que têm conteúdo usam a cor da região e ganham uma plaquinha (link) que mantém o tamanho no zoom, no mar e ligada por uma linha (campo `placa` no JSON da região). Os estados “em breve” levam listras brancas por cima da cor.
- Páginas de estado e de lugar têm o link “← Início” acima das abas. Pontos muito próximos ficam num "agrupamento" com vista ampliada (ex.: Centro do Rio, Centro de Salvador).
- Numeração dos lugares = ordem cronológica de escrita/publicação dentro do estado (campo `ordem`).
- Textos da interface em português, diretos, sem jargão.

## Regras de conteúdo (importante)

- Só obras em domínio público no Brasil: autor morto há mais de 70 anos, contados de 1º de janeiro do ano seguinte à morte (Lei 9.610/98, art. 41). Em 2026, autores mortos até 1955.
- Trechos copiados de edições em domínio público (Brasiliana USP, Domínio Público, Wikisource), nunca de edições modernas comentadas. Ortografia atualizada.
- **Conferir cada trecho na fonte antes de publicar. Não inventar citações.** Quando o local exato não é conhecido, usar `aproximado: true`.
- As notas de "Hoje" foram escritas como resumo no protótipo e ainda precisam de revisão da Bruna.

## Estado atual

- Rio de Janeiro (8 lugares): Paquetá (A Moreninha), Canto dos Meirinhos (Memórias de um Sargento de Milícias), Outeiro da Glória (Lucíola), Botafogo (O Cortiço), Rua de Mata-cavalos e Engenho Novo (Dom Casmurro), Morro do Castelo (Esaú e Jacó), Rua São Januário (Policarpo Quaresma).
- Bahia (4 lugares): engenho do Recôncavo (Sermão XIV do Rosário, Vieira), Centro Histórico (Gregório de Matos, "Triste Bahia"), Praça Castro Alves (Ode ao Dous de Julho), Canudos (Os Sertões).
- Paraná (3 lugares, mapa só do litoral ao planalto): Porto de Paranaguá e Estrada de ferro da Serra do Mar (Através do Brasil, Bilac e Bomfim, cap. LXXII, conferido no fac-símile de 1923 do Wikisource), Rio Iguaçu (soneto "Iguassú", Ilusão, Emiliano Perneta, conferido na reedição virtual de 2011 da Academia Paranaense de Letras, feita a partir da edição de 1911).
  - Candidatos ainda sem fonte digital encontrada: Nestor Vítor, A Terra do Futuro (1913, Curitiba); Silveira Neto, Do Guairá aos Saltos do Iguaçu (1914, Sete Quedas); Passeio Público de Curitiba (lançamento de Ilusão, "Ilha da Ilusão").
- Minas Gerais (3): casa de Marília em Vila Rica (Marília de Dirceu, lira do passarinho, edição de 1862), Santuário de Congonhas (O Seminarista, ed. 1875), Mina de Morro Velho (Através do Brasil, cap. LXV).
- São Paulo (3): Porto de Santos (Através do Brasil, cap. LXXI), Areias (Cidades Mortas, Lobato, 3ª ed. 1921; a cidade não é nomeada no texto), Vale do Anhangabaú (poema “Anhangabahu”, Pau Brasil, Oswald, 1ª ed. 1925).
  - Pauliceia Desvairada (Mário de Andrade) ficou de fora: o único fac-símile achado é a edição crítica de 1987; falta achar a edição de 1922.
- Ceará (3): Mucuripe e Lagoa da Porangaba (Iracema, 1ª ed. 1865, agrupamento “fortaleza”), cadeia de Sobral (Luzia-Homem, 1ª ed. 1903).
- Pernambuco (3): Ponte do Recife (O Cabeleira, 1ª ed. 1876), Engenho Massangana (Minha Formação, 1ª ed. 1900), Garanhuns (Através do Brasil, cap. IV).
- Maranhão (3): Caxias (Canção do Exílio, Primeiros Cantos, 1ª ed. 1846), Praça da Alegria e Praia Grande (O Mulato, transcritos do fac-símile da 1ª ed. 1881, que difere das edições seguintes; agrupamento “saoluis”).
- Rio Grande do Sul (3): Barra do Rio Grande (Através do Brasil, cap. LXXIX), Alegrete (Duelo de Farrapos, Contos Gauchescos, 1ª ed. 1912), Cerro do Jarau (A Salamanca do Jarau, Lendas do Sul, 1ª ed. 1913).
- Regiões sem litoral deixam `agua` vazio (ex.: minas.json).
- Páginas: início (mapa do Brasil com zoom + cards dos estados e "em breve"), página do estado, página de cada lugar (`/rio/canto-dos-meirinhos/`), 404.
- PWA simples: `public/manifest.webmanifest` e `public/sw.js` (páginas visitadas funcionam offline).
- `prototipo/index.html` é a versão de arquivo único anterior, só para referência.

## Armadilhas conhecidas

- Não escrever a tag `<script>` nem em comentários dentro de arquivos `.astro`: o scanner de dependências do Vite lê o arquivo inteiro e quebra (já aconteceu no `Mapa.astro`).
- O bloco de dados do mapa usa `<script is:inline type="application/json">`, com `<` escapado no JSON.
- O id de cada lugar vem do caminho do arquivo (`rio/canto-dos-meirinhos`); a pasta precisa bater com o campo `regiao`.

## Próximos passos combinados

1. ~~Publicar~~ (feito).
2. Novos estados, nesta ordem (Paraná entrou antes, a pedido):
   - ~~Minas Gerais, São Paulo, Ceará~~ (feitos). Pernambuco, Maranhão e Rio Grande do Sul também (2º lote). Próximo lote: Paraíba, Pará, Mato Grosso do Sul (já aparecem como “em breve”).
   - Outras candidatas: Pernambuco (Minha Formação, Nabuco, engenho Massangana), Paraíba (Augusto dos Anjos, tamarindo do engenho Pau d'Arco), Maranhão (O Mulato, Aluísio Azevedo; Gonçalves Dias), Rio Grande do Sul (Simões Lopes Neto, Pelotas, Negrinho do Pastoreio), Mato Grosso do Sul (Inocência, Taunay), Goiás (Tropas e Boiadas, Hugo de Carvalho Ramos), Pará (Contos Amazônicos, Inglês de Sousa, Óbidos).
3. Depois: sugestões de lugares por alunos e professores com moderação (ex.: Supabase); editor sem código (ex.: Decap CMS) sobre os mesmos `.md`; ilustrações profissionais substituindo os SVGs.
