# O Brasil de cada livro — contexto do projeto

Mapa afetivo e ilustrado de clássicos brasileiros em domínio público: cada lugar real onde um livro acontece vira um desenho no mapa, com o trecho original, "Então" (como era), "Hoje" (como está) e uma pergunta para a sala de aula.

Projeto pessoal da Bruna, ligado à pós-graduação em tecnologias para educação. Público principal: alunos e professores, acessando **pelo celular** (celular primeiro, mas responsivo).

## Stack e comandos

- Astro 5 + TypeScript, site estático. JavaScript no navegador só no mapa (`src/scripts/mapa.ts`) e no service worker.
- Conteúdo em content collections: `src/content/lugares/<estado>/*.md` (frontmatter validado) e `src/content/regioes/<estado>.json` (geometria do mapa). Schema em `src/content.config.ts`.
- `npm run dev` · `npm run check` · `npm run build`
- Deploy planejado: GitHub → Vercel (domínio próprio da Bruna já está na Vercel). Variável `SITE_URL` com o endereço final.
- Detalhes de estrutura, como adicionar lugar/estado e convenção dos desenhos: ver `README.md`.

## Decisões de design (manter)

- Visual único, claro e bem colorido, inspirado no casario do Pelourinho (Bahia). Sem modo escuro, por escolha.
- Paleta em `src/data/paleta.ts`: azul, rosa, amarelo, verde, laranja, lilás, turquesa, vermelho; tinta `#1E1A3A`. Cada lugar tem uma cor.
- Fontes: Lilita One (títulos), Literata (trechos dos livros), Nunito Sans (interface).
- Estilo "desenho": contornos grossos escuros, sombras sólidas deslocadas (box-shadow 4–6px), cantos arredondados, topo com fileira de casarões e faixa tipo fitinha do Bonfim.
- No mapa, os lugares são **ilustrações** (casinhas, igreja, trem, mandacaru…), não pinos. Cada desenho conta algo do livro (ex.: relógio marcando 4h15 para o Major Quaresma; Morro do Castelo tracejado porque foi demolido; igreja afundada no açude em Canudos).
- Desenhos são SVGs em `src/assets/desenhos/` com `viewBox="-34 -62 68 68"` e o pé em `0,0`. Nomes válidos em `src/data/nomes.ts`.
- Mapas são **ilustrativos e fora de escala**: contornos de costa feitos à mão a partir de coordenadas aproximadas, suavizados (Catmull-Rom). Não há dados geográficos reais. Pontos muito próximos ficam num "agrupamento" com vista ampliada (ex.: Centro do Rio, Centro de Salvador).
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
- Páginas: início (estados + "em breve"), página do estado, página de cada lugar (`/rio/canto-dos-meirinhos/`), 404.
- PWA simples: `public/manifest.webmanifest` e `public/sw.js` (páginas visitadas funcionam offline).
- `prototipo/index.html` é a versão de arquivo único anterior, só para referência.

## Armadilhas conhecidas

- Não escrever a tag `<script>` nem em comentários dentro de arquivos `.astro`: o scanner de dependências do Vite lê o arquivo inteiro e quebra (já aconteceu no `Mapa.astro`).
- O bloco de dados do mapa usa `<script is:inline type="application/json">`, com `<` escapado no JSON.
- O id de cada lugar vem do caminho do arquivo (`rio/canto-dos-meirinhos`); a pasta precisa bater com o campo `regiao`.

## Próximos passos combinados

1. Publicar: repositório no GitHub, importar na Vercel, `SITE_URL`, domínio.
2. Novos estados, nesta ordem:
   - **Minas Gerais**: Marília de Dirceu (Tomás Antônio Gonzaga, Vila Rica/Ouro Preto); O Seminarista (Bernardo Guimarães, seminário de Congonhas).
   - **São Paulo**: Brás, Bexiga e Barra Funda (Alcântara Machado); Pauliceia Desvairada (Mário de Andrade); Oswald de Andrade; Urupês (Monteiro Lobato, Vale do Paraíba).
   - **Ceará**: Iracema (José de Alencar, Messejana/Fortaleza); Luzia-Homem (Domingos Olímpio, Sobral, seca de 1877).
   - Outras candidatas: Pernambuco (Minha Formação, Nabuco, engenho Massangana), Paraíba (Augusto dos Anjos, tamarindo do engenho Pau d'Arco), Maranhão (O Mulato, Aluísio Azevedo; Gonçalves Dias), Rio Grande do Sul (Simões Lopes Neto, Pelotas, Negrinho do Pastoreio), Mato Grosso do Sul (Inocência, Taunay), Goiás (Tropas e Boiadas, Hugo de Carvalho Ramos), Pará (Contos Amazônicos, Inglês de Sousa, Óbidos).
   - Com mais estados, a página inicial deve ganhar um mapa do Brasil para escolher o estado.
3. Depois: sugestões de lugares por alunos e professores com moderação (ex.: Supabase); editor sem código (ex.: Decap CMS) sobre os mesmos `.md`; ilustrações profissionais substituindo os SVGs.
