# 💳 Guia Definitivo de Configuração na Payt — Prot+

Este documento contém todos os dados prontos para copiar e colar diretamente no painel da **Payt**, permitindo ativar a esteira de vendas, os 3 Order Bumps e o pós-venda automático do **Prot+**.

---

## 📦 1. Cadastro do Produto Principal

Acesse o painel da Payt em: **Produtos → Cadastrar Novo Produto**

| Campo | Preenchimento Exato |
|---|---|
| **Nome do Produto** | `Prot+ | 120 Receitas Proteicas + App` |
| **Formato** | Produto Digital / E-book / WebApp |
| **Categoria / Nicho** | Saúde & Fitness / Gastronomia Saudável |
| **Preço de Tabela (De)** | R$ 147,00 (Preço âncora de referência) |
| **Preço de Venda (Por)** | **R$ 27,50** |
| **Tipo de Cobrança** | Pagamento Único |
| **Prazo de Garantia** | **45 dias** (Garantia incondicional estendida da oferta) |
| **Formas de Pagamento** | PIX (Liberação Imediata) e Cartão de Crédito (à vista ou parcelado) |
| **E-mail de Suporte** | `suporte@protplus.com.br` |
| **Página de Vendas** | `https://[SEU-DOMINIO]/` |
| **Página de Agradecimento (URL)** | `https://[SEU-DOMINIO]/obrigado` (ou `04-pagina/obrigado.html`) |

### Descrição Comercial do Produto (para o checkout):
> O Prot+ é uma solução completa para bater sua meta de proteína com prazer: aplicativo web com 120 receitas práticas e autorais, valores nutricionais e macros por porção (tabela TACO), 4 ferramentas exclusivas de organização (Modo Geladeira, Cardápio Semanal, Rastreador de Proteína, Lista de Compras) e 3 bônus para acelerar seus resultados. Acesso vitalício e sem mensalidades.

---

## 🔥 2. Cadastro dos 3 Order Bumps (No Checkout)

Na aba **Order Bumps** dentro da oferta do checkout na Payt, adicione as 3 opções abaixo:

### Order Bump 1: Marmitas Proteicas
- **Nome:** `Marmitas Proteicas para a Semana`
- **Preço Âncora:** ~R$ 29,90~
- **Preço da Oferta:** **R$ 7,89** (-74% OFF)
- **Texto da Chamada (Headline):** `🔥 SIM, QUERO O GUIA DE MARMITAS POR APENAS R$ 7,89`
- **Descrição Curta:**
  > Mais de 60 receitas práticas para congelar e garantir almoço e jantar proteico para a semana inteira, sem precisar cozinhar todos os dias.

### Order Bump 2: Receitas na Air Fryer
- **Nome:** `50 Receitas Rápidas na Air Fryer`
- **Preço Âncora:** ~R$ 29,90~
- **Preço da Oferta:** **R$ 7,89** (-74% OFF)
- **Texto da Chamada (Headline):** `🔥 SIM, QUERO RECEITAS NA AIR FRYER POR APENAS R$ 7,89`
- **Descrição Curta:**
  > Preparos crocantes, saborosos e ricos em proteína feitos no aparelho em menos de 20 minutos. Zero fumaça, zero bagunça.

### Order Bump 3: Saladas Proteicas + Molhos
- **Nome:** `80 Saladas Proteicas + Molhos Caseiros`
- **Preço Âncora:** ~R$ 49,90~
- **Preço da Oferta:** **R$ 9,90** (-80% OFF)
- **Texto da Chamada (Headline):** `🔥 SIM, QUERO SALADAS PROTEICAS + MOLHOS POR R$ 9,90`
- **Descrição Curta:**
  > Combinações refrescantes e nutritivas que transformam a salada em uma refeição proteica completa, acompanhadas de molhos fáceis e saborosos.

> [!TIP]
> **Ticket Médio Potencial (AOV):**  
> Cliente que leva tudo: `R$ 27,50` + `R$ 7,89` + `R$ 7,89` + `R$ 9,90` = **R$ 53,18** (quase o dobro do ticket inicial!).

---

## ✉️ 3. Modelo do E-mail de Entrega Automática (Transacional)

Configure na Payt em **Configurações de E-mail pós-compra** (disparado imediatamente após confirmação do PIX ou Cartão):

**Assunto:**
`[ACESSO LIBERADO] Bem-vindo(a) ao Prot+! Abra seu app e baixe as receitas 📲`

**Texto do E-mail:**
```text
Olá, {cliente_primeiro_nome}!

Parabéns pela sua decisão de descomplicar a sua alimentação e atingir sua meta de proteína com sabor!

Seu pagamento foi confirmado com sucesso e o seu acesso ao Prot+ já está 100% liberado.

==================================================
👉 PASSO 1: ABRA O SEU APLICATIVO PROT+
==================================================
Clique no link abaixo para abrir o aplicativo no navegador do seu celular:
🔗 https://[SEU-DOMINIO]/app/

(Dica: Ao abrir, siga as instruções na tela para "Adicionar à Tela de Início" do seu celular. Assim você poderá consultá-lo como um app nativo, mesmo sem internet!)

==================================================
👉 PASSO 2: ACESSE OS LIVROS DIGITAIS (PDF)
==================================================
Caso queira imprimir ou salvar os livros no seu leitor de PDF:
- Livro Completo (120 Receitas): https://[SEU-DOMINIO]/pdf/receitas-prot-plus.pdf
- Café & Lanches: https://[SEU-DOMINIO]/pdf/receitas-prot-plus-cafe-lanches.pdf
- Almoço & Jantar: https://[SEU-DOMINIO]/pdf/receitas-prot-plus-almoco-jantar.pdf
- Sobremesas Proteicas: https://[SEU-DOMINIO]/pdf/receitas-prot-plus-sobremesas.pdf

==================================================
💬 PRECISA DE AJUDA OU SUPORTE?
==================================================
Se tiver qualquer dúvida durante a instalação ou quiser falar com nossa equipe:
E-mail: suporte@protplus.com.br
WhatsApp: [SEU NÚMERO DE SUPORTE AQUI]

Lembrando que você conta com a nossa garantia incondicional de 45 dias.

Bom apetite e ótimos resultados!
Equipe Prot+
```

---

## 🔗 4. Como Ativar o Link da Payt na Página de Vendas

Depois de criar o checkout na Payt, você receberá a URL final (exemplo: `https://checkout.payt.com.br/xxxxx`).

Basta abrir o arquivo [`04-pagina/index.html`](file:///Volumes/HIKSEMI/Uso%20do%20Mabook/Projetos%20Pedrinho/PROT-/04-pagina/index.html) e colar a URL na linha do script:

```javascript
const PAYT_CHECKOUT_URL = "https://checkout.payt.com.br/xxxxx";
```

Todos os botões de compra da página de vendas e a barra flutuante mobile já estão automaticamente programados para redirecionar o cliente para esse link!

---

## 🔍 5. Checklist de Teste de Compra e Homologação

1. [ ] Abrir o link de checkout em uma aba anônima.
2. [ ] Preencher dados de teste fictícios com seu próprio e-mail e celular.
3. [ ] Marcar 1 ou 2 Order Bumps para conferir se o valor soma corretamente.
4. [ ] Gerar pagamento via PIX ou cartão de teste.
5. [ ] Verificar se você é redirecionado para a página [`obrigado.html`](file:///Volumes/HIKSEMI/Uso%20do%20Mabook/Projetos%20Pedrinho/PROT-/04-pagina/obrigado.html).
6. [ ] Conferir na caixa de entrada se o e-mail de entrega chegou com os links corretos.
7. [ ] Clicar no botão "ABRIR APLICATIVO" e baixar 1 PDF de teste.
8. [ ] Estornar/reembolsar o pagamento de teste no painel da Payt.
