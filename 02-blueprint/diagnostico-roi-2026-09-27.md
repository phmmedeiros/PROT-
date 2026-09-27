# Diagnóstico de ROI — Prot+ x FIT. Pro (27/09/2026)

> **Contexto:** o Prot+ foi para o Meta Ads, vendeu, mas o ROI não fechou positivo. Este documento compara a nossa oferta com a de referência e analisa a copy para o público real.
> **Páginas comparadas:** `https://lp.comersemprebem.site/` (nossa) e `https://www.comersemprebem.shop/receitas-proteicas3` (FIT. Pro, referência).
> **Público-alvo informado pelo Paulo:** mulheres de 35 a 60 anos.
> **Autor da análise:** Paulo Henrique (com apoio de IA).

---

## Parte 1 — Comparação de oferta e funil

### O que é igual

As duas ofertas são praticamente idênticas na página:

| Item | FIT. Pro | Prot+ |
|---|---|---|
| Preço | R$ 27,50 | R$ 27,50 |
| Âncora | "De R$ 147" | "Valor total somado R$ 228" |
| Conteúdo | 120 receitas em app | 120 receitas em app + PDFs |
| Ferramentas | Filtro por proteína, Semana pronta, Modo geladeira, Contador | As mesmas 4, com outros nomes |
| Bônus | Ficha de treino, Calculadora, Whey caseiro | Os mesmos 3 |
| Garantia | 45 dias | 45 dias |
| Order bumps | Marmitas R$ 7,89 · Air fryer R$ 7,89 · Saladas R$ 9,90 | Os mesmos 3 |

A copy do Prot+ é mais longa e mais trabalhada que a dele. **A página, sozinha, não explica a diferença de resultado.**

### O que ele tem e nós não

1. **Upsell depois da compra.** Combo de 7 livros + grupo VIP no WhatsApp com a "Chefe Camila", por R$ 29,90 a R$ 39,90 (ver `01-dossie/checkout/checkout.md`, seção 5). Nós não temos upsell. Em produto de R$ 27,50, é o valor médio por venda que paga o anúncio.
2. **Autoridade com nome.** "Nutri Camila Braga" no FAQ e "Chefe Camila" no upsell. O Prot+ não tem nenhuma pessoa por trás.
3. **Prazo com data.** "Oferta válida até [data do dia]", gerada por script. Nós dizemos "exclusivo hoje", sem data.
4. **Número de clientes no topo.** "+5.000 pessoas ajudadas" logo abaixo do primeiro botão.
5. **Checkout Cakto** com pop-up de saída, Pix Automático, Apple Pay, Google Pay e parcelamento no Pix (Pagaleve) quando o cartão é recusado.
6. **Utmify** na página, ligando cada venda ao anúncio que a gerou.

### Problemas de rastreio no nosso funil

- **UTMs não chegam ao checkout.** O script do botão redireciona para `PAYT_CHECKOUT_URL` sem repassar `location.search` (`04-pagina/index.html`, perto da linha 2009). Não dá para saber qual anúncio vendeu.
- **`Purchase` com valor fixo e sem proteção contra duplicidade.** `04-pagina/obrigado.html` dispara `Purchase` com `value: 27.50` em qualquer carregamento: ignora os bumps e conta de novo se a página for recarregada ou reaberta.
- **Sem `InitiateCheckout`.** O Meta não recebe sinal nenhum entre a visita e a compra.

Consequência: o ROI que aparece no painel pode estar errado, e a campanha aprende com sinais ruins.

### Riscos de reembolso

- Os 3 bumps estão à venda, mas o conteúdo (cerca de 190 receitas) ainda não existe.
- A página promete "Funciona 100% Offline", e o app exige internet.

---

## Parte 2 — Análise da copy, da promessa e da oferta para mulheres de 35 a 60 anos

### Veredito

**A copy foi escrita para o público do anúncio de referência, e não para quem compra de verdade.** Ela fala com alguém jovem, de academia, que conta macros, toma whey e quer "hipertrofia", e trata a leitora no masculino. As duas compras reais registradas foram de mulheres. Esse desalinhamento de público é o maior problema da copy, e é barato de corrigir.

### 1. A página fala no masculino

Cada "cansado" diz à leitora: "isto não foi escrito para você".

| Onde | Trecho atual |
|---|---|
| Faixa do topo (L1132) | "SE VOCÊ ESTÁ **CANSADO** DE ENGOLIR FRANGO SECO…" |
| "Verdade crua" (L1531) | "Você começa a dieta **animado**…" |
| "Dois caminhos" (L1813) | "você volta para a cozinha **cansado**… continuar **preso**…" |

O FIT. Pro, por comparação, escreve "não ficar **satisfeita**" no FAQ.

### 2. Vocabulário de academia e de gente jovem

- "Bater sua **meta de proteína**", "macros na grama": é linguagem de quem já conta macros. A mulher de 45 anos típica não pensa em "meta de proteína". Ela pensa em barriga, fome, peso que não sai e roupa que não serve.
- "Gordice do iFood", "lanche de sexta-feira", "frango borrachudo", "água na garganta", "come como um rei", "arma de bolso", "devorar": gírias de um público mais novo, com tom agressivo.
- **Dor #3 (L1559–1564):** "Treinar pesado e o espelho não mudar… gastar dinheiro com Whey caro…". Parte do princípio de que ela treina pesado e toma whey. Boa parte dessas mulheres não faz nenhum dos dois.
- **Bônus 1 (L1743–1746):** "Push/Pull/Legs (PPL), ABC". Para esse público é jargão que intimida.
- **Cardápios "Ganhar Massa / Hipertrofia"** (L1714, L1769): não é o que ela quer.
- **Bônus 3, "Whey caseiro… pare de ser explorado"** (L1778–1786): só é relevante para quem já compra whey.

### 3. As dores reais dessa faixa quase não aparecem

O que move a mulher de 35 a 60 anos, e a página não diz:

| Dor / desejo | Presente hoje? |
|---|---|
| "Faço tudo igual e engordo; depois dos 40 o corpo mudou" | ❌ Ausente |
| Barriga que apareceu e não sai | ⚠️ Só de passagem |
| Flacidez e perda de firmeza (braços, pernas) | ❌ Ausente. É exatamente o que a proteína ajuda a proteger |
| Fome e beliscar à tarde; vontade de doce à noite | ✅ Dor #1, boa, manter |
| Cozinhar uma comida para ela e outra para a família | ✅ Dor #2, **a melhor dor da página**, mas está no meio |
| Cansaço e falta de disposição | ❌ Ausente |
| "Já tentei de tudo, dieta da moda não dura" | ⚠️ Implícito |
| Medo de tecnologia ("app", "PWA") | ❌ Não tratado |

As melhores armas que já temos estão enterradas no FAQ e na garantia:
- "seu marido… e filhos vão comer o mesmo prato… sem nem desconfiar" (FAQ, L1943)
- "se sua família não elogiar o prato, devolvemos" (garantia)
- "Tenho compulsão por doces à noite" (FAQ)

Essas três ideias deveriam estar no topo da página.

### 4. A promessa está no nível de consciência errado

Promessa atual: *"Como Bater Sua Meta de Proteína e Secar o Corpo Comendo Pratos com Sabor de 'Gordice' do iFood"*.

Na escala de consciência de Schwartz, essa frase fala com quem **já sabe que a solução é proteína**. A mulher que chega pelo anúncio geralmente só **conhece o problema**: quer emagrecer, desinchar, perder a barriga e parar de brigar com a comida. A promessa precisa partir do problema dela e só depois apresentar a proteína como o caminho.

Direções de promessa para testar (rascunhos, não copy final):
- **Família:** "Emagreça comendo a mesma comida gostosa que a sua família, sem cozinhar duas vezes e sem passar fome."
- **Fome e doce:** "Receitas com proteína que seguram a fome da tarde e matam a vontade de doce à noite, prontas em 15 minutos."
- **Corpo depois dos 35:** "O que muda no prato quando o corpo passa dos 35: proteína gostosa em cada refeição, sem shake e sem frango seco."

> ⚠️ **Política do Meta:** nos **anúncios**, não afirmar nem insinuar características pessoais ("Você está na menopausa?", "Você tem mais de 40?"). Na página de vendas, falar de "o corpo muda com os anos" é aceitável. Promessas de resultado devem ser plausíveis e sem prazo em quilos.

### 5. Mecanismo

"Arquitetura Gastronômica Proteica", "Reação Maillard", "emulsões proteicas" e "densidade proteica" soam técnicos. Para esse público funciona melhor uma explicação simples, em duas frases:
1. **Proteína em cada refeição** segura a fome e ajuda a manter a firmeza do corpo.
2. **Técnica de cozinha caseira** (a casquinha dourada, o creme sem farinha) faz a comida ficar gostosa o bastante para a família inteira comer junto.

### 6. Oferta

| Elemento | Hoje | Sugestão para esse público |
|---|---|---|
| Bônus 1 | Ficha de treino PPL / ABC | Treino em casa de 20 minutos, sem aparelho, para iniciantes |
| Bônus 2 | Calculadora de déficit | Manter, mas vender como "quanto comer para secar a barriga sem passar fome" |
| Bônus 3 | Whey caseiro ("pare de ser explorado") | Trocar o ângulo para "shakes e doces cremosos para a vontade de doce", ou tirar o destaque do whey |
| Formato | "Não é um e-book… Aplicativo PWA" | Dizer que "abre no celular como um app, sem baixar nada da loja" **e** que também vem em PDF para imprimir. Parte desse público prefere papel. |
| Nomes das ferramentas | "Seletor Turbo Protein", "Radar de Despensa", "Monitor Diário de Meta" | Nomes simples: "Receitas que mais seguram a fome", "O que dá pra fazer com o que tenho em casa", "Cardápio da semana pronto" |
| Autoridade | Ninguém | Uma pessoa real, idealmente mulher, com rosto e história. **Não inventar persona.** |
| Depoimentos | Prints | Priorizar prints de mulheres dessa idade falando de família, fome, doce e barriga |
| Comparação de preço | "Menos que uma taxa de entrega do iFood" | Algo do universo dela: "menos que um quilo de carne" ou "menos que uma pizza de sábado" |

### 7. Tom

A página e o anúncio de referência usam choque e agressividade ("ENGOLIR… COM ÁGUA NA GARGANTA", "segredo sujo", "explorado"), o que costuma funcionar com homens jovens. Para mulheres de 35 a 60, a **hipótese** é que um tom acolhedor e cúmplice converta melhor ("você não está sozinha, o corpo muda mesmo, e dá para comer bem"). Isso deve ser validado em teste A/B.

### 8. Coerência entre anúncio e página

Os criativos da Fase 5 seguem os 8 ângulos do concorrente (`01-dossie/anuncios/padroes.md`): macros, whey, "comida gorda". Se o anúncio atrai mulheres e a página fala com homem de academia, a conversão cai no meio do caminho. **Anúncio e página precisam mudar juntos.**

---

## Parte 3 — O que apareceu ao construir a v2 (27/09, mesma data)

### O Meta está contando 4 a 5 vezes mais vendas do que existem

Dados do pixel `1310891797657056` (últimos 28 dias) comparados com a tabela `compras` do Supabase:

| Fonte | Compras |
|---|---|
| Pedidos reais no banco | **12** (8 ativos, 4 cancelados) |
| `Purchase` disparado pela Payt (`checkout.payt.com.br`) | 36 |
| `Purchase` disparado pela nossa `obrigado.html` | 9 |
| **Total que o Meta recebeu** | **45** |

- A campanha otimizou em cima de vendas que não existiram, e o ROAS do painel está inflado.
- **Corrigido no código:** a `obrigado.html` não dispara mais `Purchase`.
- **Pendente no painel da Payt:** a Payt envia cerca de 3 `Purchase` por pedido. É preciso conferir na configuração do pixel se ela dispara no Pix gerado (e não só no pago), por item do carrinho (principal + bumps) ou nas duas coisas. O certo é um `Purchase` por pedido aprovado, com o valor total.
- **4 cancelamentos em 12 pedidos (33%)**, 3 deles com bump. Ver o item abaixo.

### A v1 promete coisas que o produto não entrega

Conferido contra `03-produto/dados/receitas.json`:

| A v1 diz | O acervo real |
|---|---|
| "Até 68g de proteína" | Máximo de 55,6g (AJ-041); mínimo de 9,1g |
| "Prontas em 15 minutos" | Almoço e jantar: de 18 a 25 min. 60 das 120 ficam em até 15 min |
| Vitrine com "Parmegiana Crocante 52g", "Escondidinho Fit 46g", "Hambúrguer Caseiro 42g"… | Não existem. A foto AJ-028 é "Tilápia com Abóbora e Grão-de-Bico", a AJ-033 é "Sardinha com Batata-Doce e Brócolis" etc. Todos os 20 cards da vitrine têm nome e proteína trocados |
| "Sabor de gordice do iFood / fast food" | Comida caseira saudável: arroz, feijão, frango, carne moída, tilápia, lombo, batata-doce, brócolis |
| Bônus whey: "até 40g por dose", "R$ 3 por dose" | 5 fórmulas de 19,9g a 25,6g; o custo por dose não aparece no conteúdo |
| "Funciona 100% Offline" (texto e mockup) | O app exige internet |

Comprar "sabor de fast food" e receber "tilápia com brócolis" é uma explicação provável para parte dos cancelamentos. **A v1 continua no ar com essas afirmações.**

A boa notícia: para mulheres de 35 a 60 anos, **"comida caseira de verdade, que a família já come"** é uma promessa mais forte, e é verdadeira. A v2 foi construída em cima dela.

### Depoimentos e imagens que não podem ser usados

- Os 10 prints em `04-pagina/images/depoimentos/` são **montagens** de comentários no Instagram (perfil "protmais.app", clientes que não existem no banco). Depoimento fabricado é propaganda enganosa (CDC art. 37, Código do Conar) e viola a política de anúncios do Meta, com risco de bloqueio da conta. **Não foram levados para a v2** e deveriam sair da v1.
- `app-mockup-oferta.webp` mostra "100% Offline", "Olá, Rafael" e um salmão que não está no acervo.
- Os mockups dos bônus trazem texto embutido desatualizado ("Hipertrofia & Definição", "R$ 3 por dose", "economize R$ 1.800/ano").

### Correção de duas recomendações da Parte 1

- **"Prazo com data"**: o concorrente usa uma data que é sempre o dia de hoje. Isso é urgência falsa. **Só usar prazo se o preço realmente mudar na data anunciada.**
- **"Número de clientes no topo"**: temos 8 clientes ativos. **Só usar número real.** O "+5.000" do concorrente não é um modelo a seguir.

---

## Parte 4 — Página v3: o formato do concorrente

Pedido do Paulo: uma v3 "idêntica ou 99% igual" à página de referência, para testar se o **formato** dela converte mais.

`04-pagina/v3/index.html` copia a estrutura, a ordem e o estilo visual, com texto próprio e o conteúdo real do Prot+. Ficou de fora o que é enganoso ou não é nosso:

| Na página de referência | Na v3 |
|---|---|
| Depoimentos com nome, cidade e @ | Sem depoimentos até termos prints reais autorizados |
| "Nutri Camila Braga" | Sem autoria atribuída |
| "Oferta válida até [hoje]" | Sem prazo |
| "+5.000 pessoas ajudadas" | "Acesso na hora, direto no celular · 45 dias de garantia" |
| "De R$ 147 por R$ 27,50" | "Valor somado dos itens: R$ 228 · por apenas R$ 27,50" |
| Hambúrguer, parmegiana, 68g | 12 receitas reais do acervo, com tempo, proteína e calorias |
| Texto e imagens dele | Texto próprio e fotos do nosso acervo |

**Teste sugerido:** v2 × v3, com a mesma verba e o mesmo público. A v2 testa a **mensagem** (comida caseira para mulheres de 35 a 60); a v3 testa o **formato** (página curta e visual, no estilo da referência).

---

## Plano de ação sugerido (por prioridade)

1. ✅ **Rastreio (código):** UTMs e `fbclid` repassados ao checkout (v1 e v2); `Purchase` removido da `obrigado.html`. Sem `InitiateCheckout` na página: a Payt já dispara esse evento (decisão do Paulo).
2. ⏳ **Rastreio (painel da Payt):** deixar um `Purchase` por pedido aprovado, com o valor total.
3. ✅ **v2 da página** (`04-pagina/v2/index.html`): feminino, sem jargão de academia, promessa de comida caseira, dores da família e do doce no topo, bônus reposicionados e só afirmações verificadas no acervo.
4. ✅ **v2 publicada** em `https://lp.comersemprebem.site/v2/` (27/09). ⏳ Testar contra a v1, com anúncios novos que falem com o mesmo público.
5. ⏳ **Tirar da v1** os depoimentos montados, a vitrine com nomes trocados, o "68g" e o "100% offline" (ou pausar a v1).
6. ⏳ **Depoimentos reais:** pedir aos 8 clientes ativos, com autorização por escrito.
7. ⏳ **Imagens novas:** foto do topo com uma mulher de 40 a 55 anos cozinhando para a família e mockups dos bônus sem texto desatualizado.
8. ⏳ **Upsell** na página de obrigado (depois que o conteúdo dos bumps existir).
9. ⏳ **Autoridade real:** decisão de Paulo e Pedro.
10. ⏳ **Escrever o conteúdo dos bumps** antes de escalar a verba.

**Como testar:** publicar a nova versão num endereço separado (ex.: `/v2`) e dividir a verba entre dois conjuntos de anúncios, mantendo a página atual como controle. Isso só vale depois que o rastreio estiver certo.
