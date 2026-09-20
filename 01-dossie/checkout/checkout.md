# Registro do Checkout e Esteira de Vendas (Referência)

**Plataforma de Checkout:** Cakto  
**Produto Principal:** `Fit.pro RECEITAS PROTEICAS + Bônus`  
**Preço do Produto Principal:** R$ 27,50 (Pagamento único / à vista)

---

## 1. Dados e Campos Coletados no Checkout

### Campos do Formulário
- **Nome completo:** Campo de texto simples.
- **E-mail:** Campo de e-mail (usado para envio do acesso).
- **Celular:** Campo de telefone com DDD.
- **CPF / CNPJ:** Campo obrigatório para emissão e validação antifraude.

### Formas de Pagamento Aceitas
- **PIX:** Pagamento instantâneo (Gera código Copia e Cola / QR Code).
- **Cartão de Crédito:** Parcelamento ou à vista.
- **Apple Pay:** Carteira digital no iOS.
- **Google Pay:** Carteira digital no Android.

---

## 2. Elementos Visuais e Selos de Confiança no Checkout
- **Header:** Faixa verde com destaque `"ACESSO IMEDIATO AO Fit.Pro 120 Receitas Proteicas"`.
- **Selo de Garantia:** Selo dourado de 45 dias com headline *"NUNCA MAIS SOFRA PARA BATER SUA META DE PROTEÍNA. Você vai conseguir bater sua meta de proteína sem precisar viver de frango seco e ovo cozido todos os dias."*
- **Faixa de Entrega:** *"CONCLUA SUA COMPRA E RECEBA IMEDIATAMENTE NO SEU E-MAIL"*.
- **Rodapé de Segurança:** Selo de *"Compra segura"*, links de Termos de Uso (*Lk Vision Ltda*) e Políticas da Cakto.

---

## 3. Order Bumps (Ofertas Limitadas no Checkout)

Todos os Order Bumps utilizam o título chamativo: `🔥 OFERTAS: SOMENTE HOJE` com caixa destacada em fundo amarelo claro e borda tracejada.

### Order Bump 1: Receitas de Marmitas Proteicas
- **Nome:** Receitas de Marmitas Proteicas
- **Promessa:** *"Mais de 60 receitas proteicas irresistíveis para suas marmitas! Perfeito para quem quer praticidade, sabor e variedade no dia a dia."*
- **Preço Âncora:** De ~R$ 29,90~
- **Preço Oferta:** **R$ 7,89** (-74% de desconto)
- **Chamada no Checkbox:** `☑ Adicionar produto!`

### Order Bump 2: Receitas na Air Fryer
- **Nome:** Receitas na Air Fryer
- **Promessa:** *"Mais de 50 receitas irresistíveis para sua air fryer! Perfeito para quem tem esse aparelho em casa, mas falta inspiração."*
- **Preço Âncora:** De ~R$ 29,90~
- **Preço Oferta:** **R$ 7,89** (-74% de desconto)
- **Chamada no Checkbox:** `☑ Adicionar produto!`

### Order Bump 3: 80 Receitas de Saladas Proteicas + Molhos
- **Nome:** 80 Receitas de Saladas Proteicas + Molhos
- **Promessa:** *"Mais de 80 Receitas de Saladas que combinam com suas receitas proteicas! Perfeito para nunca mais comer salada sem graça."*
- **Preço Âncora:** De ~R$ 49,90~
- **Preço Oferta:** **R$ 9,90** (-80% de desconto)
- **Chamada no Checkbox:** `☑ Adicionar produto!`

---

## 4. Resumo de Faturamento Potencial por Cliente (Ticket Médio / AOV)

| Item | Tipo | Preço |
|---|---|:---:|
| Fit.pro RECEITAS PROTEICAS + Bônus | Produto Principal (Front-end) | R$ 27,50 |
| Marmitas Proteicas | Order Bump 1 | R$ 7,89 |
| Receitas na Air Fryer | Order Bump 2 | R$ 7,89 |
| 80 Saladas Proteicas + Molhos | Order Bump 3 | R$ 9,90 |
| **Total Carrinho Cheio (Front-end + 3 Bumps)** | — | **R$ 53,18** |

---

## 5. Esteira de Pós-Venda / Upsell 1 (Página de Upsell)

**URL / Domínio do Upsell:** `receitasproteicas-upa.lovable.app`  
**Headline de Escassez:** *"560 combos restantes hoje"* / *"ACESSO EXCLUSIVO AO WHATSAPP DA CHEFE"*  
**Gancho:** *"EXCLUSIVO: as primeiras 50 pessoas que adquirirem essa oferta única terão acesso ao Grupo VIP no WhatsApp com a Chefe Camila com receitas inéditas de todos os livros."*

### Pacote Ofertado no Upsell (Mega Combo de 7 E-books / Guias):
1. **+200 Cafés da Manhã Proteicos** (Valor avulso: ~R$ 29,90~)
2. **+150 Sobremesas Proteicas sem Açúcar** (Valor avulso: ~R$ 29,90~)
3. **50 Jantares Proteicos na Air Fryer** (Valor avulso: ~R$ 29,90~)
4. **70 Receitas Proteicas com RAP10** (Valor avulso: ~R$ 29,90~)
5. **90 Receitas com Carne Moída para a Semana** (Valor avulso: ~R$ 29,90~)
6. **Guia das Marmitas Proteicas Fitness Congeladas para o Mês** (Valor avulso: ~R$ 29,90~)
7. **Saladas Proteicas no Pote** (Valor avulso: ~R$ 29,90~)

- **Valor total somado individualmente:** ~R$ 210,00~
- **Preço Promocional do Upsell:** R$ 29,90 / R$ 39,90 (Pagamento único)
- **Bônus de Suporte:** *"WhatsApp da Chefe 24h para tirar suas dúvidas"*
