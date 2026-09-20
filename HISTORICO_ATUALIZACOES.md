# 📜 Histórico de Atualizações — Prot+

Registro cronológico e rastreável de todas as atualizações, implementações e manutenções realizadas no projeto **Prot+ (Modelagem de Receitas Proteicas)**.

---

## 👥 Membros da Equipe

| Membro | Função Principal | Identificador Git / Máquina | E-mail de Contato |
|---|---|---|---|
| **Paulo Henrique** | Co-fundador / Estratégia / Marketing / Frontend & Checkout | `Paulo Henrique` (Mac OS) | `phenrimedeiros@gmail.com` |
| **Pedro Henrique** | Co-fundador / Produto / PWA / Modelagem de Oferta | `phmmedeiros` (Windows PC) | `pedro.arqtt@gmail.com` |

---

## 📌 Guia Rápido: Como Registrar uma Nova Atualização

Sempre que concluir uma alteração relevante no projeto, adicione uma nova entrada no topo da seção **[Registro de Alterações](#-registro-de-alterações)** utilizando o formato padrão:

```markdown
### [AAAA-MM-DD] Título Resumido da Mudança
- **Autor:** Paulo Henrique / Pedro Henrique
- **Módulo(s) Afetado(s):** (ex: `04-pagina/`, `03-produto/`, etc.)
- **Tipo:** `feat` (nova funcionalidade), `fix` (correção), `docs` (documentação), `refactor` (refatoração), `style` (design/css)
- **Commit:** `hash_do_commit` (ou *Local / Em andamento*)
- **O que foi feito:**
  - Descrição detalhada 1
  - Descrição detalhada 2
- **Arquivos modificados/criados:**
  - `caminho/do/arquivo1`
  - `caminho/do/arquivo2`
```

---

## 🚀 Registro de Alterações

### [2026-09-20] Publicação e Deploy na Hostinger: lp.comersemprebem.site e comersemprebem.site
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/`, `03-produto/`, `06-entrega/`
- **Tipo:** `deploy` / `infra`
- **Commit:** `ea1a1ad`
- **O que foi feito:**
  - Criação e configuração do subdomínio `lp.comersemprebem.site` na Hostinger com certificado SSL vitalício ativo e redirecionamento HTTPS automático.
  - Deploy completo da estrutura da Landing Page (`index.html`, `style.css`, `script.js`, `images/`, `obrigado.html`, `termos.html`, `privacidade.html`).
  - Deploy do aplicativo PWA integrado (`app/` com fotos WebP `w400/` e `w900/`, ícones do manifest e service worker) e dados JSON (`dados/receitas.json`, `dicas-chef.json`, `bonus.json`).
  - Configuração de `.htaccess` com tipos MIME modernos (`image/webp`, `application/json`), regras de cache e compatibilidade.
  - Configuração de redirecionamento 301 da raiz e www de `comersemprebem.site` para `https://lp.comersemprebem.site/`.
  - Execução e aprovação da suite de testes de QA contra `https://lp.comersemprebem.site/app/` (33 testes aprovados, 0 falhas).
- **Arquivos modificados/criados:**
  - `06-entrega/publicacao.md`
  - `PROGRESSO.md`
  - `HISTORICO_ATUALIZACOES.md`

---

### [2026-09-20] Aplicativo Prot+ Completo: 8 Telas, 4 Ferramentas, 3 Bônus e QA Automatizado
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `03-produto/app/`, `03-produto/dados/`, `local-preview-server.mjs`
- **Tipo:** `feat`
- **Commit:** `034405f`
- **O que foi feito:**
  - Reescrita do PWA a partir do esboço, cobrindo as 8 telas de `02-blueprint/produto.md`:
    Início, Catálogo, Detalhe da receita, Seletor Turbo, Radar de Despensa,
    Semana Blindada, Monitor Diário e Central de Bônus.
  - Navegação por hash (`#/receitas`, `#/receita/CL-001`), para o botão "voltar"
    do celular funcionar dentro do app instalado; eventos por delegação, no lugar
    do religamento de `onclick` a cada render.
  - **Semana Blindada** implementada conforme a especificação: 3 objetivos,
    7 dias × 4 refeições sem receita repetida, troca de refeição avulsa e
    lista de compras consolidada dos 28 pratos.
  - **Radar de Despensa** com os 39 ingredientes do acervo agrupados por tipo,
    ingrediente personalizado e ranqueamento por proporção de itens disponíveis.
  - **Monitor Diário** com anel de progresso, meta calculada pelo peso corporal,
    exclusão individual, reset e zeragem automática na virada do dia.
  - **Bônus preenchidos com conteúdo real** em `03-produto/dados/bonus.json`:
    3 divisões de treino (PPL, ABC, Upper/Lower) com 94 exercícios em versão de
    academia e de casa, 6 regras de progressão, calculadora Mifflin-St Jeor com
    nível de atividade e distribuição de macros, e o manual do whey caseiro com
    5 fórmulas, 6 substituições econômicas e 6 técnicas de sabor.
  - **Dica de Ouro do Chef por receita** (`03-produto/dados/dicas-chef.json`),
    gerada a partir do ingrediente principal e da técnica de cada preparo,
    no lugar do texto genérico único.
  - **Fotos otimizadas:** 279,5 MB de PNG passaram a 15,1 MB em WebP
    (`images/w400/` para os cards, `images/w900/` para o detalhe). Os PNGs
    originais foram mantidos porque alimentam os PDFs e a página de vendas.
  - **App instalável:** ícones 192/512/maskable e apple-touch gerados,
    `manifest.json` com ícones e atalhos, e passo a passo de instalação
    separado para Android e iPhone.
  - **Service worker** reescrito com duas estratégias: estrutura pré-cacheada na
    instalação e fotos guardadas sob demanda, com limpeza de caches antigos.
  - **Correção:** o registro do service worker ficava preso em um `addEventListener`
    de `load` que já havia disparado, então o modo offline nunca era ativado.
  - **Correção:** a ficha de treino estourava a largura de 390 px e escondia a
    coluna de descanso; virou lista numerada.
  - **QA automatizado** (`tools/qa-app.mjs`): dirige um Chrome headless pelo
    DevTools Protocol, percorre as telas, executa as interações, testa o modo
    offline, falha em qualquer erro de console e salva 12 prints.
- **Arquivos modificados/criados:**
  - `03-produto/app/index.html`, `style.css`, `app.js`, `manifest.json`, `service-worker.js`
  - `03-produto/app/tools/otimizar-imagens.py`, `gerar-icones.py`, `gerar-dicas.py`, `qa-app.mjs`
  - `03-produto/app/images/w400/`, `images/w900/`, `images/icons/`
  - `03-produto/dados/bonus.json`, `03-produto/dados/dicas-chef.json`
  - `03-produto/app/qa.md`, `03-produto/app/qa/` (12 prints)
  - `local-preview-server.mjs` (tipo MIME `image/webp`)

### [2026-09-20] O Aplicativo por Dentro: 3 Mockups Realistas em Smartphone e Pilares Mobile
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/index.html`, `04-pagina/images/`
- **Tipo:** `feat` / `ui` / `conversion`
- **Commit:** `c8abf40`
- **O que foi feito:**
  - Substituição da vitrine estática e repetitiva de pratos por uma seção dedicada a **mostrar o aplicativo Prot+ por dentro** em uso real na cozinha:
    1. `images/app-catalogo.jpg`: Smartphone nas mãos em cozinha moderna exibindo o catálogo com mais de 120 receitas calculadas na grama e filtros por meta de proteína.
    2. `images/app-receita.jpg`: Smartphone sobre bancada exibindo a ficha técnica com tabela de macros na grama, checklist de ingredientes e preparo em 12 minutos.
    3. `images/app-geladeira.jpg`: Smartphone em frente à geladeira aberta demonstrando o "Modo Geladeira Inteligente" (cruza ingredientes disponíveis e gera pratos na hora).
  - Inclusão dos 4 pilares mobile do app (Instalação em 1 clique sem loja de apps, Modo 100% Offline, Método 15 min Anti-Louça e Acesso Imediato no Checkout).
  - Grid responsivo de alta conversão: 1 coluna no mobile (390px) e 3 colunas niveladas em telas maiores.
- **Arquivos modificados/criados:**
  - `04-pagina/index.html`
  - `04-pagina/images/app-catalogo.jpg`
  - `04-pagina/images/app-receita.jpg`
  - `04-pagina/images/app-geladeira.jpg`

---

### [2026-09-20] Visualização do Mecanismo Único: 3 Cards Fotográficos de Culinária Proteica
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/index.html`, `04-pagina/images/`
- **Tipo:** `feat` / `ui` / `conversion`
- **Commit:** `e00bded`
- **O que foi feito:**
  - Transformação da seção de Mecanismo ("Arquitetura Gastronômica Proteica") em 3 cartões visuais de alta gastronomia com imagens fotográficas:
    1. `images/mecanismo-textura.jpg`: Colher erguendo um creme sedoso e aveludado em macrofotografia (A Ilusão da Textura Sedosa).
    2. `images/mecanismo-crosta.jpg`: Frigideira quente selando crosta dourada caramelizada e queijo (Reação Maillard Anti-Louça).
    3. `images/mecanismo-densidade.jpg`: Prato refinado de corte macio suculento com redução brilhante (Densidade Proteica sem Estufamento).
  - Layout com imagem 16:9, selo flutuante de autoridade científica (`🔬 Princípio #1`, `🔥 Princípio #2`, `⚡ Princípio #3`), badge numérico circular (`01`, `02`, `03`) e frases-chave de alto impacto.
  - Alinhamento responsivo mobile-first estrito (1 coluna no mobile a 390px e 3 colunas niveladas em desktop).
- **Arquivos modificados/criados:**
  - `04-pagina/index.html`
  - `04-pagina/images/mecanismo-textura.jpg`
  - `04-pagina/images/mecanismo-crosta.jpg`
  - `04-pagina/images/mecanismo-densidade.jpg`

---

### [2026-09-20] Otimização Mobile: Alinhamento das Dores com Fotos Temáticas e Foco no Gancho de Culinária
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/index.html`, `04-pagina/images/`, `local-preview-server.mjs`
- **Tipo:** `feat` / `ui` / `conversion`
- **Commit:** `67f0fec`
- **O que foi feito:**
  - **Foco Puro na Retenção na 2ª Dobra:** Removida a listagem prematura de entregáveis (App PWA, 30 sobremesas, método anti-louça e 3 bônus) abaixo do carrossel duplo, mantendo apenas o gancho de curiosidade magnético sobre o segredo gastronômico de ter sabor de fast food sem farinha nem açúcar, induzindo a continuidade da rolagem.
  - **Reestruturação Visual dos 3 Cards de Dores Ocultas ("O problema não é sua força de vontade"):**
    - Geração e inclusão de 3 imagens fotográficas de alto impacto emocional:
      1. `images/dor-recaida.jpg`: Fissura noturna em frente à geladeira com doce.
      2. `images/dor-duas-comidas.jpg`: Cozinheira sobrecarregada cozinhando comida de dieta seca e refeição comum ao mesmo tempo.
      3. `images/dor-espelho.jpg`: Frustração olhando para a barriga no espelho após treino exaustivo.
    - Novo layout vertical unificado com proporção 16:9, badges flutuantes de dor (`🔴 Dor #1`, `🔴 Dor #2`, `🔴 Dor #3`) e alinhamento milimétrico em viewport mobile de 390px (e 3 colunas esticadas em desktop).
    - Ajuste no roteamento do servidor local (`local-preview-server.mjs`) para servir estáticos de `04-pagina/images/`.
- **Arquivos modificados/criados:**
  - `04-pagina/index.html`
  - `04-pagina/images/dor-recaida.jpg`
  - `04-pagina/images/dor-duas-comidas.jpg`
  - `04-pagina/images/dor-espelho.jpg`
  - `local-preview-server.mjs`

---

### [2026-09-20] Segunda Dobra Bidirecional: Carrossel Duplo em Movimentos Opostos (Esquerda e Direita)
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/index.html`
- **Tipo:** `feat` / `ui` / `style`
- **Commit:** `4a75679`
- **O que foi feito:**
  - Evolução da segunda dobra com 2 linhas horizontais animadas e sincronizadas em sentidos opostos:
    - **Linha 1 (Rolando para a esquerda):** 10 pratos principais e salgados de alta densidade proteica (Crepioca Crocante, Frango Dourado, Tilápia, Hambúrguer Fit, Parmegiana, Escondidinho, etc.) com badges de proteína até 52g.
    - **Linha 2 (Rolando para a direita):** 10 sobremesas, doces e shakes anti-compulsão (Cheesecake de Morango, Panqueca Vulcão, Gelato Dark Cacau, Milkshake, Mousse, Brownie, Waffle, etc.).
    - Duplicação exata de cada linha (total de 40 cards) gerando loop contínuo e fluido de 360 graus sem engasgos.
    - Efeito de pausa ao passar o mouse ou toque prolongado (`:hover`).
    - Proteção de viewport com `overflow-x: hidden` no elemento `html` e `body` para navegação mobile estável.
- **Arquivos modificados:**
  - `04-pagina/index.html`

---

### [2026-09-20] Segunda Dobra de Alto Impacto: Slider Infinito de Receitas em Movimento e Stack de Valor
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/index.html`
- **Tipo:** `feat` / `ui` / `conversion`
- **Commit:** `e316075`
- **O que foi feito:**
  - Criação da nova Segunda Dobra visual focada em reter a atenção e acelerar o impulso de compra:
    - Carrossel infinito animado (CSS Marquee contínuo para a esquerda) com 10 receitas reais do acervo (duplicadas para loop perfeito de 20 cards), com foto apetitosa, nome e badge de proteína, transmitindo imediatamente a percepção de abundância gastronômica.
    - Seção "ISSO É TUDO O QUE VOCÊ VAI RECEBER" com visual stack claro dos 4 componentes do produto (App PWA, 30 sobremesas, método anti-louça de 15 min e 3 bônus).
    - Inclusão do gancho de curiosidade ("escorregador") convidando o prospect a continuar a rolagem para entender a química do mecanismo culinário.
- **Arquivos modificados:**
  - `04-pagina/index.html`

---

### [2026-09-20] Otimização Mobile Direct Response Extrema: Foto da Persona, Remoção de Menu e Efeito No-Brainer
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/index.html`, `04-pagina/images/`
- **Tipo:** `feat` / `ui` / `conversion`
- **Commit:** `35a3961`
- **O que foi feito:**
  - Remoção completa da barra de navegação/menu superior, logo e botões institucionais para eliminar pontos de fuga e foco em marca.
  - Adição de barra de alerta máxima no topo (`⚠️ ATENÇÃO...`).
  - Substituição da imagem isolada do prato pela imagem autêntica da Persona (`04-pagina/images/hero-persona.jpg`): mulher brasileira atlética na cozinha comendo um hambúrguer suculento com satisfação e alívio, conectando imediatamente com a dor e o desejo de secar o corpo sem passar fome.
  - Implementação da **Oferta Antecipada (Fast-Offer Banner)** logo após a dobra inicial para capturar compras por impulso (leads de decisão rápida).
  - Implementação do bloco psicológico **"As Duas Escolhas" (The Fork in the Road)** antes da oferta final, evidenciando o custo da inação e gerando o efeito "no-brainer" (onde recusar a compra parece a decisão mais irracional do dia).
  - Calibração de layout estrita para celulares (viewport de 390px): espaçamentos reduzidos, leitura fluida em escorregador, botões CTA com animação pulsante e barra sticky inferior para fechamento rápido.
- **Arquivos modificados/criados:**
  - `04-pagina/index.html` [MODIFICADO]
  - `04-pagina/images/hero-persona.jpg` [NOVO]

---

### [2026-09-20] Copywriting Visceral de Alta Conversão para Público Frio (Direct Response)
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/index.html`, `.gitignore`
- **Tipo:** `copy` / `feat`
- **Commit:** `fdcfa71`
- **O que foi feito:**
  - Substituição integral da copy institucional da página de vendas por uma narrativa visceral de Direct Response desenhada para tráfego pago frio.
  - Incorporação cirúrgica das 11 dores ocultas e ruminações mentais do avatar:
    1. Permissão para comer gostoso sem culpa (quebrando a ideia de que dieta precisa ser punição).
    2. Fim do ciclo de desistir da dieta na 1ª semana pela monotonia do frango grelhado.
    3. Solução real para a compulsão noturna por doces (sobremesas proteicas densas).
    4. Quebra do trauma de "receita fit com gosto de papelão" através da explicação química da Arquitetura Gastronômica Proteica.
    5. Foco no resultado real no espelho (secar barriga e ganhar tônus), conectando a proteína à estética.
    6. Destruição do concorrente invisível: o delivery/iFood de madrugada por desespero.
    7. Eliminação da pia cheia de louça (método de 1 panela só e pratos prontos em 15 minutos).
    8. Destruição do medo de errar na cozinha (passo a passo infalível com medidas caseiras).
    9. Fim da fadiga mental de decidir o que cozinhar (Modo Geladeira e Cardápio Blindado).
    10. Monitoramento em tempo real para não desperdiçar o treino na academia.
    11. Inimigo comum: a indústria de Whey protein caro de R$ 200 (reforçando o Whey caseiro).
    - Dor Social: fim da necessidade de cozinhar duas comidas na mesma casa (pratos que a família toda adora).
  - Rebatismo sensorial de todas as 6 receitas da vitrine com linguagem de dar água na boca.
  - Atualização do `.gitignore` contra metadados do macOS (`._*`).
- **Arquivos modificados:**
  - `04-pagina/index.html`
  - `.gitignore`

---

### [2026-09-20] Execução da Fase 6: Página de Obrigado, Entrega, Páginas Legais e Esteira Payt
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/`, `06-entrega/`, raiz (`local-preview-server.mjs`)
- **Tipo:** `feat` / `docs`
- **Commit:** `e2ab412`
- **O que foi feito:**
  - Criação da Página de Obrigado e Entrega oficial (`04-pagina/obrigado.html`) com status de pagamento confirmado, botão de abertura imediata do app PWA, passo a passo visual para instalação na tela inicial (iOS/Safari e Android/Chrome), central de download direto dos 4 livros em PDF e canal de suporte VIP.
  - Criação das páginas legais obrigatórias: Termos de Uso (`04-pagina/termos.html`) e Política de Privacidade (`04-pagina/privacidade.html`) em total conformidade com o Código de Defesa do Consumidor e LGPD.
  - Atualização da página de vendas (`04-pagina/index.html`) integrando links legais no rodapé, disclaimer de desvinculação da Meta/Facebook e variável centralizada `PAYT_CHECKOUT_URL` no script com redirecionamento automático dos botões de compra.
  - Reestruturação do manual de checkout (`06-entrega/payt-configuracao.md`) com dados cadastrais completos, os 3 Order Bumps formatados, template pronto do e-mail de entrega pós-compra e checklist de testes e homologação.
  - Atualização do servidor de testes local (`local-preview-server.mjs`) com suporte a rotas amigáveis (`/obrigado`, `/termos`, `/privacidade`, `/pdf/*`), todas respondendo com status 200.
  - Atualização do checklist de entregáveis em `06-entrega/checklist-roteiro.md`.
- **Arquivos modificados/criados:**
  - `04-pagina/obrigado.html` [NOVO]
  - `04-pagina/termos.html` [NOVO]
  - `04-pagina/privacidade.html` [NOVO]
  - `04-pagina/index.html` [MODIFICADO]
  - `06-entrega/payt-configuracao.md` [MODIFICADO]
  - `06-entrega/checklist-roteiro.md` [MODIFICADO]
  - `local-preview-server.mjs` [MODIFICADO]

---

### [2026-09-20] Configuração de Governança para Equipe de 2 Pessoas e Histórico
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** Raiz do projeto, `.agents/`, documentação
- **Tipo:** `docs` / `chore`
- **Commit:** `38e2228`
- **O que foi feito:**
  - Definição formal da atuação compartilhada de **Paulo** e **Pedro** no desenvolvimento do Prot+.
  - Criação do manual de boas práticas para trabalho em dupla (`BOAS_PRATICAS_EQUIPE.md`), abordando fluxo Git, branches, sincronização Mac/Windows, prevenção de conflitos e convenção de commits.
  - Criação deste documento oficial de rastreabilidade de autoria (`HISTORICO_ATUALIZACOES.md`).
  - Criação das instruções de contexto para assistentes de IA (`AGENTS.md`) assegurando suporte contínuo ao fluxo de dois desenvolvedores.
  - Atualização do arquivo mestre `PROGRESSO.md` com referências aos manuais de equipe.
- **Arquivos modificados/criados:**
  - `HISTORICO_ATUALIZACOES.md` [NOVO]
  - `BOAS_PRATICAS_EQUIPE.md` [NOVO]
  - `AGENTS.md` [NOVO]
  - `PROGRESSO.md` [MODIFICADO]

---

### [2026-09-20] Index Raiz com Redirecionamento para a Página de Vendas
- **Autor:** Pedro Henrique (`phmmedeiros`)
- **Módulo(s) Afetado(s):** Raiz (`index.html`)
- **Tipo:** `feat`
- **Commit:** `f42d2b4`
- **O que foi feito:**
  - Criação do arquivo `index.html` na raiz do projeto com script de redirecionamento imediato e meta refresh direcionando para `04-pagina/index.html`.
  - Garante que qualquer visitante ou servidor apontado para a raiz acesse diretamente a página de vendas do produto.
- **Arquivos modificados/criados:**
  - `index.html`

---

### [2026-09-20] Integração das Imagens Finais (Sobremesas e Almoço/Jantar) e Otimização do App
- **Autor:** Pedro Henrique (`phmmedeiros`)
- **Módulo(s) Afetado(s):** `03-produto/app/`, `04-pagina/`, `PROGRESSO.md`
- **Tipo:** `feat`
- **Commit:** `3cb9962`
- **O que foi feito:**
  - Inclusão do lote final de imagens de receitas: `AJ-046` a `AJ-050` (5 receitas de Almoço/Jantar) e `SOB-001` a `SOB-030` (30 receitas de Sobremesas Proteicas).
  - Conclusão da cobertura de 100% das 120 receitas com imagens gastronômicas associadas (`03-produto/app/images/`).
  - Atualização da página de vendas (`04-pagina/index.html`) integrando imagens reais em alta resolução nos blocos de demonstração visual da oferta.
  - Atualização das regras de cache do Service Worker (`03-produto/app/service-worker.js`) para suportar e cachear o novo acervo de fotos offline no PWA.
  - Atualização do log de status no `PROGRESSO.md`.
- **Arquivos modificados/criados:**
  - `03-produto/app/images/AJ-046.png` até `AJ-050.png`
  - `03-produto/app/images/SOB-001.png` até `SOB-030.png`
  - `03-produto/app/service-worker.js`
  - `04-pagina/index.html`
  - `PROGRESSO.md`

---

### [2026-09-20] Implementação Completa da Modelagem Prot+ (Fases 0 a 6 Locais)
- **Autor:** Pedro Henrique (`phmmedeiros`)
- **Módulo(s) Afetado(s):** Todo o repositório (`01-dossie/`, `02-blueprint/`, `03-produto/`, `04-pagina/`, `05-criativos/`, `06-entrega/`)
- **Tipo:** `feat`
- **Commit:** `c8c6b00`
- **O que foi feito:**
  - **Fase 0 (Workspace):** Criação da arquitetura de pastas padronizada e configuração de controle do projeto.
  - **Fase 1 (Dossiê da Oferta):** Captura de 26 prints mobile (390px) e print completo da página concorrente original em `01-dossie/pv/prints/`. Extração completa da copy em `texto-original.md`, mapa de blocos em `mapa-de-blocos.md`, análise de design/cores em `visual.md`. Mapeamento do checkout, 3 order bumps e upsell em `01-dossie/checkout/`. Fichamento de 8 anúncios vencedores da biblioteca Meta em `01-dossie/anuncios/vencedores.md` e síntese de padrões em `padroes.md`.
  - **Fase 2 (Blueprint Prot+):** Decisões estratégicas (preço de R$ 27,50, mecanismo "Arquitetura Gastronômica Proteica", promessas e 3 bônus ancorados). Especificação comparativa bloco a bloco em `02-blueprint/blueprint.md` e arquitetura técnica do app em `02-blueprint/produto.md`.
  - **Fase 3 (Produto Prot+ PWA e PDFs):**
    - Construção do banco completo de 120 receitas com ingredientes, porções, passos numerados e macros TACO (`03-produto/dados/receitas.json`).
    - Memória de cálculo detalhada em `03-produto/dados/calculo-macros.md`.
    - Desenvolvimento do aplicativo PWA vanilla (HTML, CSS e JS puros) em `03-produto/app/` com catálogo, filtros por macro e tempo, ferramentas interativas (Modo Geladeira, Cardápio Semanal, Rastreador de Proteína, Lista de Compras) e os 3 bônus embutidos.
    - Suporte offline via `manifest.json` e `service-worker.js`.
    - 40 imagens de café/lanches e 45 imagens de almoço/jantar adicionadas em `03-produto/app/images/`.
    - Script de compilação PDF (`03-produto/pdf/gerar-pdfs.js`) e geração de 4 livros digitais formatados (Completo, Café/Lanches, Almoço/Jantar, Sobremesas).
    - QA visual mobile (390px) com evidências salvas em `03-produto/app/qa/`.
  - **Fase 4 (Página de Vendas Prot+):**
    - Construção da Landing Page mobile-first autoral (`04-pagina/index.html`, `style.css`, `script.js`) estruturada estritamente nos 18 blocos de alta conversão.
    - Tabela comparativa e checklist de conformidade em `04-pagina/conferencia.md`.
    - QA visual em viewport mobile em `04-pagina/qa/`.
  - **Fase 5 (Criativos):**
    - 8 roteiros de criativos autorais modelados a partir dos ângulos vencedores em `05-criativos/roteiros/` (Sabor Inesperado, Rotina Real, Arquitetura, Comida de Verdade, Doce Planejado, Sem Repetição, Meta no Celular, Convite Semana).
  - **Fase 6 (Checkout, Esteira e Entrega):**
    - Guias de infraestrutura e publicação (`06-entrega/publicacao.md`).
    - Configuração da esteira Payt (`06-entrega/payt-configuracao.md`).
    - Checklists de auditoria e status final local (`qa-checklist.md`, `checklist-roteiro.md`, `status-final.md`).
  - **Servidor de Preview Local:** Criação do script `local-preview-server.mjs` (porta 4174) para testar a página e o PWA localmente.
- **Arquivos modificados/criados:** 162 arquivos criados e validados no commit inicial.

---

## 📊 Resumo de Contribuições por Membro

| Membro | Foco Principal | Principais Entregas | Status Atual |
|---|---|---|---|
| **Pedro Henrique** | Produto, Modelagem, PWA, Acervo Visual & Copy | Fases 1 a 6 concluídas localmente; 120 receitas; PWA; 120 imagens; LP de vendas; PDFs; 8 roteiros de criativos. | Concluído lote inicial e base técnica |
| **Paulo Henrique** | Estratégia, Checkout, Página de Obrigado, Integrações & QA | Governança da equipe; QA de conversão; estruturação de checkout Payt; página de agradecimento e esteira pós-compra. | Em andamento |
