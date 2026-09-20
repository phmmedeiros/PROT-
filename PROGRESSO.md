# Progresso do Projeto: Modelagem Receitas Proteicas

**Status atual:** Fase 6 — checkout Payt, QA final e entrega. O produto, os PDFs e a página estão prontos localmente; faltam URL pública, configuração externa e testes de compra.

**Equipe:** [Paulo Henrique](mailto:phenrimedeiros@gmail.com) & [Pedro Henrique](mailto:pedro.arqtt@gmail.com)  
**Histórico de Autoria:** [`HISTORICO_ATUALIZACOES.md`](./HISTORICO_ATUALIZACOES.md)  
**Manual da Equipe:** [`BOAS_PRATICAS_EQUIPE.md`](./BOAS_PRATICAS_EQUIPE.md)  
**Diretrizes de IA:** [`AGENTS.md`](./AGENTS.md)

**Última atualização:** 20/09/2026 — Webhook da Payt cadastrado e testado com o payload real (compra → conta → e-mail de acesso). Segredos no Vault da Supabase. App, página de vendas e banco no ar. Falta subir o limite de e-mails/hora antes do tráfego.


---

## Status Geral por Fase

- [x] **Fase 0: Preparar o Workspace no Antigravity**
  - [x] Estrutura de pastas criada (`01-dossie/`, `02-blueprint/`, `03-produto/`, `04-pagina/`, `05-criativos/`, `06-entrega/`)
  - [x] Regras do projeto registradas em `.agents/rules/ROTEIRO.md`
  - [x] Arquivo `PROGRESSO.md` ativo e atualizado

- [x] **Fase 1: Montar o Dossiê da Oferta Original (`01-dossie/`)**
  - [x] **1.1 Captura da Página de Vendas (`01-dossie/pv/`):**
    - [x] 26 prints sequenciais da página mobile (390px) + print full-page em `01-dossie/pv/prints/`
    - [x] Todo o texto visível extraído fielmente em `01-dossie/pv/texto-original.md`
    - [x] Mapa de blocos estruturado e comparado com os 18 blocos oficiais em `01-dossie/pv/mapa-de-blocos.md`
    - [x] Identidade visual detalhada (cores, fontes Google Fonts, estilos de botões e animações) em `01-dossie/pv/visual.md`
  - [x] **1.2 Registro do Checkout e Esteira (`01-dossie/checkout/`):**
    - [x] Campos pedidos e formas de pagamento registrados em `01-dossie/checkout/checkout.md`
    - [x] 3 Order Bumps catalogados com nomes, promessas, âncoras e preços de oferta
    - [x] Upsell 1 (esteira pós-compra no Lovable) documentado com produtos e âncoras
  - [x] **1.3 Fichamento dos Anúncios Vencedores (`01-dossie/anuncios/`):**
    - [x] Template das 8 fichas criado em `01-dossie/anuncios/vencedores.md`
    - [x] Anúncio 01 (ID: 1896669007671621) catalogado (Roteiro + Legenda + Análise)
    - [x] Anúncio 02 (ID: 851168204410707) catalogado (Roteiro + Legenda + Análise)
    - [x] Anúncio 03 (ID: 1404224081768843) catalogado (Roteiro + Legenda + Análise)
    - [x] Anúncio 04 (ID: 25861662423532082) catalogado (Roteiro + Legenda + Análise)
    - [x] Anúncio 05 (ID: 1391698572868516) catalogado (Roteiro + Legenda + Análise)
    - [x] Anúncio 06 (ID: 1515301703384827) catalogado (Roteiro + Legenda + Análise)
    - [x] Anúncio 07 (ID: 2499163900545654) catalogado (Roteiro + Legenda + Análise)
    - [x] Anúncio 08 (ID: 1893980728204517) catalogado (Roteiro + Legenda + Análise)
    - [x] Geração do arquivo `01-dossie/anuncios/padroes.md` pelo Antigravity

- [x] **Fase 2: Blueprint da Nossa Oferta (`02-blueprint/`)**
  - [x] Respostas das decisões estratégicas (Nome do produto: Prot+, mecanismo: Arquitetura Gastronômica Proteica, preço: R$ 27,50, bônus ancorados)
  - [x] Criação de `02-blueprint/blueprint.md` (tabela comparativa e copy autoral dos 18 blocos)
  - [x] Criação de `02-blueprint/produto.md` (especificação do app PWA, 4 ferramentas e 3 bônus)
  - [x] *[Parada de Aprovação do Pedro]*

- [x] **Fase 3: Construir o Produto (`03-produto/`)**
  - [x] Lote 1 do banco de receitas: 20 receitas de café e lanches com macros TACO (`03-produto/dados/receitas.json` e `03-produto/dados/calculo-macros.md`)
  - [x] Auditoria do roteiro concluída; passos explicitamente numerados e memória de cálculo complementada com ingredientes auxiliares
  - [x] Lote 2 do banco de receitas: 20 receitas adicionais de café e lanches (`CL-021` a `CL-040`), com memória de cálculo e conferência de 3 receitas
  - [x] Banco completo: 120 receitas distribuídas em 40 café/lanches, 50 almoço/jantar e 30 sobremesas
  - [x] Primeira versão do PWA em HTML, CSS e JS puros (`03-produto/app/`), com catálogo, filtros, ferramentas, bônus, localStorage e service worker
  - [x] QA visual em viewport de 390 px, navegação principal e prints das telas (`03-produto/app/qa/`)
  - [x] Bônus implementados e espaços reservados de fotos identificados pelo nome das receitas
  - [x] PDFs visuais gerados: completo e separados por categoria em `03-produto/pdf/`
  - [x] Aplicativo completo: as 8 telas do blueprint, roteamento por hash e eventos delegados
  - [x] As 4 ferramentas funcionando por inteiro (Seletor Turbo, Radar de Despensa, Semana Blindada com lista de compras, Monitor Diário)
  - [x] Os 3 bônus com conteúdo real (`03-produto/dados/bonus.json`): 94 exercícios, calculadora Mifflin-St Jeor e manual do whey caseiro
  - [x] Dica de Ouro do Chef por receita (`03-produto/dados/dicas-chef.json`)
  - [x] Fotos otimizadas para o app: 279,5 MB de PNG → 15,1 MB em WebP (`images/w400/`, `images/w900/`)
  - [x] App instalável: ícones do manifest, atalhos e passo a passo de instalação para Android e iPhone
  - [x] Modo offline verificado com a rede desligada
  - [x] QA automatizado com 63 verificações e 12 prints, passando em produção (`03-produto/app/tools/qa-app.mjs`)
  - [x] Login por link mágico e banco Supabase (`03-produto/supabase/`): acesso só para quem comprou, com corte automático em reembolso
  - [x] Dados da pessoa sincronizados entre aparelhos (favoritos, meta, consumo, despensa e cardápio)
  - [x] Edge Function do webhook da Payt escrita, aguardando o formato real do payload
  - [x] Acesso administrativo para Paulo e Pedro, sem compra e sem poluir o relatório de vendas
  - [x] Guia do Resend com o DNS do domínio já auditado (`03-produto/supabase/resend.md`)
  - [x] SMTP do Resend ligado; link mágico entregue e clicado de ponta a ponta
  - [x] Doze melhorias de usabilidade: primeiro acesso guiado, tela acesa ao cozinhar, carregamento visível, convite para instalar, botão fixo de registrar, passo atual, lista de compras marcável, "Comi" no cardápio, nome na tela, ajuda, porções e lembrete por notificação

- [ ] **Fase 4: Construir a Página de Vendas (`04-pagina/`)**
  - [x] Esqueleto com 18 blocos e variáveis (`04-pagina/index.html`)
  - [x] Preenchimento da copy autoral sem plágio
  - [x] Conferência estrutural (`04-pagina/conferencia.md`)
  - [x] QA inicial em viewport de 390 px

- [ ] **Fase 5: Criativos Modelados dos Vencedores (`05-criativos/`)**
  - [x] 8 roteiros autorais com fichas, ganchos e CTAs em `05-criativos/roteiros/`
  - [x] Conferência de originalidade e ausência de frases-chave copiadas
  - [ ] *[Parada de Aprovação do Pedro]*

- [ ] **Fase 6: Checkout, Esteira, QA e Entrega (`06-entrega/`)**
  - [x] Guia de publicação e deploy (`06-entrega/publicacao.md`)
  - [x] Checklist de QA, checkout e entrega (`06-entrega/qa-checklist.md`)
  - [x] Página de Obrigado e Entrega criada (`04-pagina/obrigado.html`)
  - [x] Termos de Uso e Política de Privacidade integrados (`04-pagina/termos.html`, `privacidade.html`)
  - [x] Manual detalhado da Payt com 3 Order Bumps e template de e-mail (`06-entrega/payt-configuracao.md`)
  - [x] Variável de checkout centralizada no script da página de vendas (`04-pagina/index.html`)
  - [x] Servidor de preview local atualizado com rotas amigáveis (`local-preview-server.mjs`)
  - [x] PDFs das receitas gerados e validados (`03-produto/pdf/`)
  - [x] Fichas de cadastro e imagens 800x800 preparadas para a Payt (`05-checkout/cadastro-payt.md` e `05-checkout/imagens-payt/`)
  - [x] Link de checkout da Payt ativado e integrado aos CTAs da Landing Page (`https://checkout.payt.com.br/8b77902c47ab4ecdabdcd7909b342ad9`)
  - [x] Publicação em domínio/hospedagem pública (`lp.comersemprebem.site` e `comersemprebem.site` na Hostinger com SSL)
  - [x] Webhook da Payt cadastrado (postback "PayT V1"), segredos no Vault, seis cenários testados com o payload real
  - [x] Compra simulada → conta criada → e-mail de acesso entregue → link abre dentro do app (verificado pelo Paulo)
  - [ ] QA completo no celular real e compra de teste autorizada (Parada 4)

---

## 📌 Onde Paramos / Próximo Passo Imediato

1. **Estado Atual:** app, login, banco, webhook da Payt e lembretes no ar e testados. Pendências antes de ligar o tráfego:
   - Supabase: subir o limite de **30 e-mails/hora** — cada compra agora dispara um e-mail sozinha; a cliente 31 da hora não recebe.
   - Página de vendas: revisar a promessa de funcionamento offline (o app exige internet).
   - Compra real de teste na Payt, para fechar o circuito com pagamento de verdade (a função guarda o payload; ajuste é rápido se algo vier diferente).
   - [`02-blueprint/blueprint.md`](./02-blueprint/blueprint.md) e [`02-blueprint/produto.md`](./02-blueprint/produto.md) criados e especificados para o **Prot+**.
2. **Próximo Passo Imediato (Fase 3 - Construir o Produto):**
   - **Lote 1 concluído:** 20 receitas autorais de café e lanches, com memória de cálculo e conferência independente de 3 receitas.
   - **Lote 2 concluído e aguardando revisão:** mais 20 receitas de café e lanches (`CL-021` a `CL-040`).
   - **Lote 3 concluído e aguardando revisão:** 20 receitas de almoço e jantar (`AJ-001` a `AJ-020`).
   - **Lote 4 concluído e aguardando revisão:** mais 20 receitas de almoço e jantar (`AJ-021` a `AJ-040`).
   - **Lote 5 concluído e aguardando revisão:** 10 receitas finais de almoço/jantar e 10 sobremesas (`AJ-041` a `AJ-050` e `SOB-001` a `SOB-010`).
   - **Lote 6 concluído e aguardando revisão:** 20 sobremesas finais (`SOB-011` a `SOB-030`).
   - Após a aprovação do acervo, iniciar a construção do PWA somente com plano prévio, conforme o roteiro.
   - Construir a aplicação PWA do **Prot+** (`03-produto/app/`) em HTML, CSS e JS puros com catálogo de receitas, filtros, modo geladeira, cardápio semanal, rastreador diário e os 3 bônus integrados.
**Atualização de imagens:** 20/09/2026 — 120 imagens gastronômicas geradas e salvas em `03-produto/app/images/`, uma por receita, associadas pelo ID e integradas ao catálogo e à tela de detalhes do PWA.
**Atualização da página de vendas:** 20/09/2026 — nova página single-file implementada em `04-pagina/index.html`, com foco mobile-first, CTAs, oferta, garantia, FAQ e 8 fotos reais do acervo. Validada em localhost com status 200 e imagens carregando.
**Atualização do aplicativo:** 20/09/2026 — conferidos os IDs do banco contra `03-produto/app/images/`: 120 receitas, 120 arquivos e nenhum ausente. Cards e detalhes usam `images/{ID}.png`; service worker atualizado para cachear as imagens carregadas.
