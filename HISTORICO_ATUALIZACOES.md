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
