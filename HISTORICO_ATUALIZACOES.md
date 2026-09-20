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

### [2026-09-20] Webhook Reconhece a Chave Única da Payt (v4)
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `03-produto/supabase/`
- **Tipo:** `feat`
- **Commit:** *Local / Em andamento*
- **O que foi feito:**
  - Postback cadastrado na Payt (tipo "PayT V1", "notificar erros" ligado) com a
    URL da função e o `secret` embutido.
  - A chave única do postback foi guardada (`.segredos` e Vault, `PAYT_CHAVE_UNICA`).
    O webhook a **reconhece** em qualquer cabeçalho ou campo, aninhado ou não, e
    devolve `chave_payt` dizendo onde a achou — **sem exigir**, porque o lugar
    exato só se confirma numa chamada real. Testado: campo simples, campo
    aninhado, cabeçalho e ausência.
  - Quando a primeira chamada real mostrar o lugar, a chave vira segunda trava.
- **Arquivos:** `supabase/functions/payt-webhook/index.ts`, `supabase/README.md`.

### [2026-09-20] Remoção do Botão Sticky CTA Mobile e Deploy Hostinger
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/`, `06-entrega/`
- **Tipo:** `style` / `refactor`
- **Commit:** *Local / Em andamento*
- **O que foi feito:**
  - Remoção da barra flutuante fixa (`.sticky-bar` / `#stickyBar`) e do botão sticky mobile no rodapé da Landing Page.
  - Limpeza das regras de CSS associadas e ajuste no seletor JavaScript de redirecionamento de checkout.
  - Deploy em produção na Hostinger para `https://lp.comersemprebem.site/` e purga de cache da CDN via MCP (`hosting_clearWebsiteCacheV1`).
  - Verificação com `curl` confirmando a ausência do elemento fixo em produção.
- **Arquivos modificados/criados:**
  - `04-pagina/index.html`
  - `HISTORICO_ATUALIZACOES.md`

### [2026-09-20] Segredos no Vault e Webhook Testado de Ponta a Ponta
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `03-produto/supabase/`
- **Tipo:** `feat`
- **Commit:** `a6008fa`
- **O que foi feito:**
  - O painel de segredos das Edge Functions não é alcançável por MCP nem por CLI sem
    token pessoal. Os quatro segredos (`PAYT_WEBHOOK_SECRET`, `CRON_SECRET`,
    `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`) foram gravados no **Vault** do banco
    (migration `0006`); as funções leem de lá quando não há variável de ambiente.
    `public.segredo()` só é chamável pelo `service_role`.
  - `payt-webhook` v3 e `enviar-lembretes` v2 publicadas com essa leitura.
  - **Testes contra produção:** sem segredo → 401; segredo errado → 401; GET → 405;
    "pix gerado" → ignorado sem criar conta; **compra simulada aprovada → conta
    criada, compra registrada e e-mail "Seu acesso ao Prot+" entregue pelo Resend**;
    reenvio do mesmo pedido não duplica nem reenvia e-mail; lembretes → 200.
  - Verificador de segurança: apenas os dois avisos conhecidos e intencionais.
- **Pendente:** colar a URL do webhook no painel da Payt — o único passo fora do
  alcance do agente. A compra de teste (`TESTE-COMPRA-001`,
  `phenrimedeiros+compra@gmail.com`) pode ser apagada depois de usada.
- **Arquivos:** `supabase/migrations/0006_segredos_no_vault.sql`,
  `supabase/functions/payt-webhook/index.ts`, `supabase/functions/enviar-lembretes/index.ts`,
  `supabase/README.md`.

### [2026-09-20] Criação de Mockups 3D dos Bônus e Deploy Hostinger
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/`, `06-entrega/`
- **Tipo:** `feat` / `marketing`
- **Commit:** *Local / Em andamento*
- **O que foi feito:**
  - Criação de mockups 3D digitais fotorrealistas para os 3 bônus exclusivos da oferta:
    1. `bonus-1-treino.webp` (Capa de Livro 3D com lombada, textura de verniz, selo dourado 100% Grátis e fotografia de treino integrada).
    2. `bonus-2-calculadora.webp` (Mockup de iPad Pro / Dashboard 3D com widgets e anéis de macros: Proteína, Carboidrato e Gorduras).
    3. `bonus-3-whey.webp` (Capa de Livro 3D gastronômico com shake proteico cremoso e selo de economia de R$ 1.800/ano).
  - Redesenho completo da seção de bônus em `04-pagina/index.html` com layout responsivo em grid split (mockup à esquerda + conteúdo detalhado, checklists de entregáveis e âncora de preço individual à direita).
  - Deploy em produção na Hostinger para `https://lp.comersemprebem.site/` e purga de cache da CDN via MCP (`hosting_clearWebsiteCacheV1`).
  - Verificação com `curl` aprovada com status `HTTP/2 200` para todos os 3 mockups no ar.
- **Arquivos modificados/criados:**
  - `04-pagina/index.html`
  - `04-pagina/images/bonus/bonus-1-treino.webp`
  - `04-pagina/images/bonus/bonus-2-calculadora.webp`
  - `04-pagina/images/bonus/bonus-3-whey.webp`
  - `HISTORICO_ATUALIZACOES.md`

### [2026-09-20] Atualização dos Depoimentos Reais (Pasta NOSSOS) e Deploy Hostinger
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/`, `06-entrega/`
- **Tipo:** `feat` / `marketing`
- **Commit:** *Local / Em andamento*
- **O que foi feito:**
  - Substituição dos depoimentos anteriores pelos 10 prints reais contidos em `Downloads/comersemprebem depoimentos/nossos/`.
  - Conversão e otimização das 10 imagens PNG originais para formato WebP de alto desempenho (`dep1.webp` a `dep10.webp` em 500x888 px), reduzindo o peso total de ~14.5 MB para apenas ~608 KB (ganho massivo de velocidade de carregamento mobile).
  - Atualização do track do slider horizontal em `04-pagina/index.html` com a sequência dos 10 prints reais duplicada para loop infinito 100% contínuo e fluído.
  - Ajuste de proporção no CSS (altura 390px no desktop e 345px no mobile) e duração da animação para 42s.
  - Deploy estático em produção na Hostinger (`https://lp.comersemprebem.site/`) e purga de cache da CDN via MCP (`hosting_clearWebsiteCacheV1`).
  - Validação `HTTP/2 200` confirmada para todos os 10 novos prints em produção.
- **Arquivos modificados/criados:**
  - `04-pagina/index.html`
  - `04-pagina/images/depoimentos/dep1.webp` ... `dep10.webp`
  - `HISTORICO_ATUALIZACOES.md`

### [2026-09-20] Integração do Meta Pixel no Site e Página de Obrigado com Deploy Hostinger
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/`, `06-entrega/`
- **Tipo:** `feat` / `marketing`
- **Commit:** *Local / Em andamento*
- **O que foi feito:**
  - Instalação do script oficial do Meta Pixel (ID: `1310891797657056`) na tag `<head>` da página de vendas (`04-pagina/index.html`) com rastreamento padrão de `PageView`.
  - Instalação do Meta Pixel na tag `<head>` da página de obrigado (`04-pagina/obrigado.html`) com eventos de `PageView` e `Purchase` (conversão com valor parametrizado de R$ 27,50 BRL).
  - Deploy estático em produção na Hostinger para `https://lp.comersemprebem.site/` e purga de cache da CDN via MCP (`hosting_clearWebsiteCacheV1`).
  - Verificação com `curl` aprovada confirmando o Pixel ativo e rastreando nas páginas publicadas.
- **Arquivos modificados/criados:**
  - `04-pagina/index.html`
  - `04-pagina/obrigado.html`
  - `HISTORICO_ATUALIZACOES.md`

### [2026-09-20] Inclusão de Depoimentos Reais em Slider Infinito na LP e Deploy Hostinger
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/`, `06-entrega/`
- **Tipo:** `feat` / `marketing`
- **Commit:** *Local / Em andamento*
- **O que foi feito:**
  - Importação e otimização dos 6 prints reais de depoimentos (`dep1.webp` a `dep6.webp`) para o diretório `04-pagina/images/depoimentos/`.
  - Implementação de slider horizontal contínuo (marquee infinito passando para a esquerda com loop suave) posicionado estrategicamente logo abaixo do preço e do botão de compra da oferta principal.
  - Estilização moderna com cards simulando telas de smartphone com bordas arredondadas, sombras elegantes, pause on hover e máscara com gradiente de fade nas laterais.
  - Deploy completo em produção na Hostinger (`https://lp.comersemprebem.site/`) e purga de cache da CDN via MCP (`hosting_clearWebsiteCacheV1`).
  - Testes de integridade em produção aprovados com status HTTP/2 200 para todas as imagens e estilos.
- **Arquivos modificados/criados:**
  - `04-pagina/index.html`
  - `04-pagina/images/depoimentos/dep1.webp`
  - `04-pagina/images/depoimentos/dep2.webp`
  - `04-pagina/images/depoimentos/dep3.webp`
  - `04-pagina/images/depoimentos/dep4.webp`
  - `04-pagina/images/depoimentos/dep5.webp`
  - `04-pagina/images/depoimentos/dep6.webp`
  - `HISTORICO_ATUALIZACOES.md`

### [2026-09-20] Doze Melhorias de Usabilidade, Publicadas e Verificadas em Produção
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `03-produto/app/`, `03-produto/supabase/`, `06-entrega/publicacao.md`
- **Tipo:** `feat`
- **Commit:** `9eb2741` (app), `ba70f04` (docs), `1e9b31d` (config)
- **O que foi feito** (numeração da proposta aprovada):
  1. **Primeiro acesso guiado:** uma pergunta (peso) → meta pronta. Fim do 140 g arbitrário. Guardado em `perfis.peso_kg` e `perfis.boas_vindas_em`; não se repete em outro aparelho.
  2. **Tela acesa enquanto cozinha** (Wake Lock), só com receita aberta; solta ao sair e retoma ao voltar.
  3. **Carregamento visível** no lugar da tela em branco dos 2–4 s de abertura no 4G.
  4. **Convite para instalar** uma vez após o primeiro acesso, dispensável e lembrado. Mitiga o apagamento de sessão do iOS em 7 dias sem uso.
  5. **"Adicionar ao consumo" preso na base** da tela de receita.
  6. **Passo atual do preparo** marcável por toque, sem rolar a tela.
  7. **Lista de compras marcável**, com marcações que sobrevivem a fechar/reabrir (só neste aparelho).
  8. **"Comi" direto do cardápio** da Semana Blindada.
  9. **Nome por campo na tela**, no lugar do `prompt()` do navegador.
  10. **"Precisa de ajuda?"** dentro do app.
  11. **1, 2 ou 3 porções**: ingredientes escalam, macros seguem por porção.
  12. **Lembrete diário por notificação:** painel no Monitor, tabela `push_assinaturas`, Edge Function `enviar-lembretes` (envia só a quem não registrou nada no dia), cron `prot-plus-lembretes` a cada hora. Assinatura cancelada ao sair da conta.
- **Verificação:** suíte ampliada de 38 para **63 verificações**; **63/63 em produção** (`app.comersemprebem.site`), incluindo assinatura push real no Chrome.
- **Lição registrada:** o deploy da Hostinger é assíncrono; testar segundos depois pegou a versão anterior. A suíte agora sonda a URL canônica antes de rodar, e a publicação inclui limpar o cache do CDN.
- **Pendente (painel):** `CRON_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` em Edge Functions > Secrets — até lá o lembrete não dispara, mesmo ligado no app.
- **Arquivos:** `app.js`, `conta.js`, `config.js`, `style.css`, `service-worker.js` (v5), `tools/qa-app.mjs`, `supabase/migrations/0004`, `0005`, `supabase/functions/enviar-lembretes/index.ts`, `supabase/README.md`, `06-entrega/publicacao.md`.

### [2026-09-20] Ingrediente Personalizado Sincroniza Entre Aparelhos
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `03-produto/app/app.js`, `tools/qa-app.mjs`
- **Tipo:** `fix`
- **Commit:** `9eb2741` (app), `ba70f04` (docs), `1e9b31d` (config)
- **O que foi feito:**
  - Ingrediente que a pessoa digita no Radar de Despensa gravava a seleção em
    `despensa`, mas o chip não reaparecia em outro aparelho porque a lista
    `extras` vivia só no cache local. Agora `extras` é derivada do que está
    salvo: tudo em `despensa` que não pertence aos 39 ingredientes do acervo.
    Sem migration, sem tabela nova.
  - QA ganhou a verificação "ingrediente digitado volta do servidor sem cache".
  - Republicado em `app.comersemprebem.site`; suíte de 38 verificações passou
    contra a URL pública.
### [2026-09-20] Aplicativo Publicado em app.comersemprebem.site
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `03-produto/app/`, Hostinger, `06-entrega/publicacao.md`
- **Tipo:** `feat`
- **Commit:** `9eb2741` (app), `ba70f04` (docs), `1e9b31d` (config)
- **O que foi feito:**
  - Subdomínio `app.comersemprebem.site` criado na Hostinger.
  - Aplicativo publicado: 256 arquivos, 15,3 MB.
  - Script de empacotamento (`tools/preparar-publicacao.py`), em Python para
    rodar também no Windows do Pedro.
  - **QA completo contra a URL pública: 37 verificações, 0 falhas.**
  - Estrutura de publicação resolvida sem alterar código: o app fica na raiz do
    subdomínio e os JSON numa pasta `dados/` ao lado, porque o navegador impede
    que `..` suba acima da raiz — o mesmo caminho serve local e publicado.
  - Os 280 MB de PNG originais ficam fora do pacote; o app usa só as WebP.
- **Achado para a Fase 4:** 40 das 50 imagens de `04-pagina/index.html` apontam
  para `../03-produto/app/images/`. Publicadas em `lp.`, essas 40 quebram.
  Saídas registradas em `06-entrega/publicacao.md`.
- **Pendente:** ligar o SMTP do Resend na Supabase. Sem isso os links de acesso
  não saem — o envio nativo já responde 429 (limite esgotado).

### [2026-09-20] Deploy em Produção na Hostinger com Checkout Payt Ativo
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/`, `03-produto/app/`, `06-entrega/`
- **Tipo:** `deploy` / `feat`
- **Commit:** *Local / Em andamento*
- **O que foi feito:**
  - Empacotamento e deploy estático em produção na Hostinger para o domínio `https://lp.comersemprebem.site/`.
  - Atualização da Landing Page com o link oficial do checkout da Payt (`https://checkout.payt.com.br/8b77902c47ab4ecdabdcd7909b342ad9`) no botão principal de compra (`#btnMainOffer`) e na variável JavaScript `PAYT_CHECKOUT_URL`.
  - Publicação dos novos módulos de autenticação e banco de dados do aplicativo PWA (`app/config.js`, `app/conta.js` e `app/vendor/supabase.js`).
  - Purga de cache da CDN da Hostinger via MCP `hosting_clearWebsiteCacheV1`.
  - Validação HTTP/2 200 em produção para página de vendas e scripts de autenticação.
- **Arquivos modificados/criados:**
  - `04-pagina/index.html`
  - `05-checkout/cadastro-payt.md`
  - `06-entrega/publicacao.md`
  - `PROGRESSO.md`

### [2026-09-20] Acesso Administrativo e Escolha do Resend para E-mail
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `03-produto/supabase/`, `03-produto/app/`
- **Tipo:** `feat`
- **Commit:** `9eb2741` (app), `ba70f04` (docs), `1e9b31d` (config)
- **O que foi feito:**
  - **Tabela `administradores`** com `phenrimedeiros@gmail.com` e
    `pedro.arqtt@gmail.com`. `tenho_acesso()` passou a aceitar dois caminhos:
    ser administrador **ou** ter compra ativa.
  - **Decisão de modelagem:** admin NÃO entra em `compras`. Se entrasse, todo
    relatório de vendas contaria os dois sócios como clientes. Verificado:
    `compras` tem 1 linha (a de teste) e `perfis` tem 3.
  - **Contas de Paulo e Pedro criadas** em `auth.users`, sem senha — entram por
    link mágico, como as clientes.
  - **Função `sou_admin()`** e tarja laranja no app avisando que a sessão é
    administrativa, para não confundirem o que veem com o que a cliente vê.
  - **Teste do controle de acesso** com 5 situações: admin sem compra entra;
    e-mail com maiúsculas entra; compradora entra e não é admin; quem não é nem
    admin nem compradora fica de fora.
  - **Resend escolhido para o envio de e-mail.** Guia completo em
    `03-produto/supabase/resend.md`, com o estado real do DNS já conferido.
  - **DNS auditado:** `comersemprebem.site` não tem SPF, DKIM nem MX. Campo livre
    para o Resend, mas o domínio não recebe e-mail — resposta de cliente ao link
    mágico volta com erro, então é preciso um `Reply-To` que funcione.
  - **QA ampliado** para 37 verificações, incluindo a separação entre conta de
    compradora e conta administrativa. 0 falhas.
- **Pendente (só vocês podem fazer):**
  - Criar o domínio `send.comersemprebem.site` no Resend e me passar os
    registros DNS — eu publico na Hostinger.
  - Ligar o SMTP do Resend na Supabase.
  - Atentar ao limite do plano gratuito: cada login gasta um e-mail.
- **Arquivos modificados/criados:**
  - `03-produto/supabase/migrations/0003_acesso_administrativo.sql`
  - `03-produto/supabase/resend.md`, `03-produto/supabase/README.md`
  - `03-produto/app/conta.js`, `app.js`, `style.css`
  - `03-produto/app/tools/qa-app.mjs`

### [2026-09-20] Integração do Link Real de Checkout da Payt na Página de Vendas
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `04-pagina/`, `05-checkout/`, `06-entrega/`
- **Tipo:** `feat` / `marketing`
- **Commit:** *Local / Em andamento*
- **O que foi feito:**
  - Configuração do link real de checkout da Payt (`https://checkout.payt.com.br/8b77902c47ab4ecdabdcd7909b342ad9`) nos botões de CTA da página de vendas (`04-pagina/index.html`).
  - Atualização do botão principal de oferta (`#btnMainOffer`) e da variável centralizada `PAYT_CHECKOUT_URL` no script client-side.
  - Registro da URL oficial nos documentos operacionais `05-checkout/cadastro-payt.md`, `06-entrega/publicacao.md` e `PROGRESSO.md`.
- **Arquivos modificados/criados:**
  - `04-pagina/index.html`
  - `05-checkout/cadastro-payt.md`
  - `06-entrega/publicacao.md`
  - `PROGRESSO.md`

### [2026-09-20] Login por Link Mágico e Banco de Dados (Supabase)
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `03-produto/app/`, `03-produto/supabase/`, `.gitignore`
- **Tipo:** `feat`
- **Commit:** `9eb2741` (app), `ba70f04` (docs), `1e9b31d` (config)
- **Decisão:** o app deixa de ser link aberto. Só entra quem comprou, e os dados
  da pessoa passam a acompanhá-la entre aparelhos. Em troca, o app passa a
  **exigir internet** — a página de vendas não pode mais prometer uso offline.
- **O que foi feito:**
  - **Projeto Supabase `Prot+`** (`zhbvlqlkdpbtqvctrerw`, região `sa-east-1`).
  - **Banco:** 6 tabelas (`compras`, `perfis`, `favoritos`, `despensa`,
    `consumo`, `semanas`), RLS em todas, função `tenho_acesso()` e trigger que
    cria o perfil junto com o usuário.
  - **Controle de acesso em três travas:** cadastro público desligado, usuário
    criado apenas pelo webhook da compra, e checagem de compra ativa a cada
    abertura — reembolso corta o acesso sozinho.
  - **Isolamento verificado em teste:** com 3 favoritos e 2 compras no banco,
    cada conta enxergou apenas os próprios (2 e 1), e a conta reembolsada
    recebeu `tenho_acesso() = false`.
  - **Login por link mágico** (`conta.js`): sem senha, sem "esqueci minha senha".
    Telas de entrada, link enviado, sem compra ativa, erro e sem conexão.
  - **Sincronização:** favoritos, meta, objetivo, consumo do dia, despensa e
    cardápio da semana passam a viver no banco. O envio é agrupado e manda só o
    que mudou; o cache local existe apenas para a tela pintar na hora.
  - **Cache separado por usuário:** dois e-mails no mesmo celular não veem os
    dados um do outro nem por um instante.
  - **Edge Function `payt-webhook`:** cria o acesso na compra aprovada e derruba
    em reembolso. Como a Payt ainda não tem webhook documentado, a leitura dos
    campos é tolerante e o payload cru fica guardado para ajuste depois da
    primeira compra de teste.
  - **Cliente Supabase hospedado por nós** (`vendor/supabase.js`), sem depender
    de CDN em tempo de execução.
  - **Endurecimento apontado pelo verificador da Supabase:** `criar_perfil()` e
    `marcar_atualizacao()` estavam expostas como endpoints REST; `EXECUTE` foi
    revogado (migration `0002`).
  - **Credencial de QA fora do Git:** `.qa-credenciais` no `.gitignore`; a suíte
    recusa rodar sem a variável de ambiente.
- **Correções:**
  - **Monitor Diário zerava 3 horas cedo:** a data era calculada em UTC, então às
    21h no horário de Brasília o app já achava que era outro dia e apagava o
    consumo da pessoa. Passou a usar `America/Sao_Paulo`, igual ao banco.
  - **Tela branca sem internet:** a abertura ficava pendurada esperando o
    servidor. Agora detecta a falta de rede, explica o que houve e reabre sozinha
    quando a conexão volta.
- **QA:** suíte reescrita para autenticar antes de testar e conferir cada ação
  **no banco**, não só na tela. 35 verificações, 0 falhas, 12 prints.
- **Arquivos modificados/criados:**
  - `03-produto/supabase/migrations/0001_esquema_inicial.sql`, `0002_restringir_execucao_de_funcoes.sql`
  - `03-produto/supabase/functions/payt-webhook/index.ts`, `03-produto/supabase/README.md`
  - `03-produto/app/conta.js`, `config.js`, `vendor/supabase.js`
  - `03-produto/app/app.js`, `index.html`, `style.css`, `service-worker.js`
  - `03-produto/app/tools/qa-app.mjs`, `03-produto/app/qa.md`, `03-produto/app/qa/`
  - `06-entrega/publicacao.md`, `.gitignore`

### [2026-09-20] Criação de Imagens 800x800 e Fichas de Cadastro de Produtos na Payt
- **Autor:** Paulo Henrique
- **Módulo(s) Afetado(s):** `05-checkout/`
- **Tipo:** `feat` / `marketing`
- **Commit:** *Local / Em andamento*
- **O que foi feito:**
  - Geração e padronização das imagens em alta definição e formato quadrado exato de 800x800 pixels para o Produto Principal e os 3 Order Bumps da esteira Payt.
  - Redimensionamento e otimização das imagens fotográficas em `05-checkout/imagens-payt/` (`01_prot_plus_produto_principal_800x800.jpg`, `02_order_bump_marmitas_proteicas_800x800.jpg`, `03_order_bump_air_fryer_proteica_800x800.jpg` e `04_order_bump_saladas_proteicas_800x800.jpg`).
  - Criação da imagem oficial única de checkout na dimensão exata exigida pela Payt: **650x290 pixels** (`05-checkout/imagens-payt/checkout_payt_650x290.jpg`), com branding Prot+, mockup gastronômico, checklist e selo de 45 dias.
  - Criação do documento completo `05-checkout/cadastro-payt.md` com nomes de alta conversão, headlines, precificação (R$ 27,50 principal, R$ 7,89 bumps 1 e 2, R$ 9,90 bump 3) e copies prontas para copiar e colar diretamente no painel da Payt.
- **Arquivos modificados/criados:**
  - `05-checkout/cadastro-payt.md`
  - `05-checkout/imagens-payt/checkout_payt_650x290.jpg`
  - `05-checkout/imagens-payt/01_prot_plus_produto_principal_800x800.jpg`
  - `05-checkout/imagens-payt/02_order_bump_marmitas_proteicas_800x800.jpg`
  - `05-checkout/imagens-payt/03_order_bump_air_fryer_proteica_800x800.jpg`
  - `05-checkout/imagens-payt/04_order_bump_saladas_proteicas_800x800.jpg`

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
