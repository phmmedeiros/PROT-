# Especificação Completa do Produto: Prot+ App & Bônus

**Nome do Produto:** Prot+ (Aplicativo de Receitas Proteicas)  
**Formato:** Progressive Web App (PWA) Mobile-First  
**Tecnologia:** HTML5, CSS3 Moderno, JavaScript Puro (ES6+), LocalStorage, Service Worker  
**Acesso:** Vitalício / Pagamento Único  

---

## 1. Estrutura do Acervo de Receitas (+120 Receitas)

O acervo do **Prot+** conta com mais de 120 receitas testadas, hiperpalatáveis e de alto valor biológico, organizadas em 3 categorias fundamentais:

### 🍳 Categoria 1: Café da Manhã & Lanches Rápidos (+40 receitas)
* **Foco:** Opções práticas de 5 a 12 minutos para começar o dia com energia e saciedade ou para lanches intermediários que evitam furos na dieta.
* **Exemplos de pratos:** Panquecas proteicas de banana com cacau, crepiocas recheadas, pães de queijo proteicos de frigideira, muffins salgados, vitaminas anabólicas e pastas proteicas para pães.
* **Densidade Proteica Média:** 25g a 42g por porção.

### 🍲 Categoria 2: Almoço & Jantar Anabólico (+50 receitas)
* **Foco:** Refeições completas, reconfortantes e estruturadas em conceito *One-Pan* (preparo em uma única panela ou airfryer em até 15 minutos).
* **Exemplos de pratos:** Strogonoff proteico express, hambúrguer artesanal fit, frango crocante com crosta dourada de parmesão, pizzas de frigideira proteicas, escondidinho fit de carne seca e bowls proteicos orientais.
* **Densidade Proteica Média:** 38g a 65g por porção.

### 🍨 Categoria 3: Sobremesas & Doces Fit (+30 receitas)
* **Foco:** Doces que eliminam a compulsão por açúcar e recriam texturas cremosas e aveludadas sem farinhas refinadas ou açúcar branco.
* **Exemplos de pratos:** Mousse trufado de cacau com whey, brownie fudge de micro-ondas, cheesecake fit de frutas vermelhas, pudim proteico de caneca, brigadeiro fit e sorvetes proteicos express.
* **Densidade Proteica Média:** 20g a 35g por porção.

---

## 2. As 4 Ferramentas Inteligentes do Prot+

Todas as ferramentas foram batizadas com nomes proprietários e desenvolvidas para eliminar qualquer atrito na rotina do usuário:

| Ferramenta Original | Nome Autoral no Prot+ | Função Prática no Aplicativo |
|---|---|---|
| **Filtro por Proteína** | **Seletor Turbo Protein** | Permite filtrar instantaneamente as receitas por faixas exatas de proteína (15g–25g para lanches, 26g–40g para refeições médias e 41g–65g+ para super anabólicas), facilitando bater a meta da refeição. |
| **Semana Pronta** | **Semana Blindada Prot+** | Cardápio inteligente de 7 dias montado automaticamente de acordo com o objetivo do usuário (Secar Gordura, Ganho de Massa Magra ou Manutenção/Recomposição), com botão de geração de Lista de Compras da semana. |
| **Modo Geladeira** | **Radar de Despensa Prot+** | O usuário seleciona os ingredientes que já tem em casa (ovos, frango, aveia, iogurte, queijo, atum, etc.) e o app lista na hora as receitas possíveis sem precisar ir ao supermercado. |
| **Contador de Proteína** | **Monitor Diário de Macros Prot+** | Rastreador interativo onde o usuário define sua meta diária de proteína e clica em "Adicionar ao Meu Dia" dentro das receitas, acompanhando a barra de progresso visual em tempo real. |

---

## 3. Os 3 Bônus Oficiais Inclusos

### 🎁 Bônus 1: Fichas de Treino Hipertrofia & Definição Prot+
* **Valor Ancorado:** R$ 37,00 (100% Grátis na oferta)
* **O que entrega:**
  - Guia completo de divisão de treinos para academia e para treinar em casa.
  - Estruturas de treino: Push / Pull / Legs (PPL), ABC e Upper / Lower.
  - Séries, repetições ideais, intervalos de descanso e orientações de progressão de sobrecarga.

### 🎁 Bônus 2: Calculadora Metabólica Inteligente Prot+
* **Valor Ancorado:** R$ 38,29 (100% Grátis na oferta)
* **O que entrega:**
  - Ferramenta interativa de cálculo de Taxa Metabólica Basal (TMB) e Gasto Energético Diário Total (GET).
  - Ajuste de calorias e distribuição matemática de macronutrientes (proteínas, carboidratos e gorduras) conforme o objetivo (Déficit para queimar gordura ou Superávit para hipertrofia).

### 🎁 Bônus 3: Manual do Whey Caseiro & Proteína Econômica
* **Valor Ancorado:** R$ 29,90 (100% Grátis na oferta)
* **O que entrega:**
  - 5 formulações práticas de shakes e concentrados proteicos caseiros de baixo custo.
  - Guia de substituições econômicas no supermercado para bater proteína gastando pouco.
  - Técnicas de saborização natural para melhorar o perfil de sabor e textura.

---

## 4. Mapa Completo de Telas do Aplicativo Prot+

A aplicação é composta por 8 telas/visões funcionais interligadas por uma barra de navegação inferior (Bottom Navigation) fixa e intuitiva:

```
┌─────────────────────────────────────────────────────────────┐
│                    PROT+ APP NAVEGAÇÃO                      │
│                                                             │
│  [🏠 Início]   [📖 Receitas]   [🛠️ Ferramentas]   [🎁 Bônus]  │
└─────────────────────────────────────────────────────────────┘
```

### 📱 Tela 1: Início / Dashboard (Home)
* **O que mostra:**
  - Cabeçalho com saudação personalizada e logo do Prot+.
  - **Widget do Monitor Diário:** Barra de progresso circular/horizontal com a meta de proteína do dia (Ex: *85g de 140g consumidos - 60%*).
  - **Acesso Rápido às 4 Ferramentas:** 4 botões em destaque (*Seletor Turbo*, *Radar de Despensa*, *Semana Blindada*, *Monitor Diário*).
  - **Destaque do Chef do Dia:** Card com a receita em alta do dia com foto apetitosa, tempo e gramas de proteína.
  - **Carrossel de Categorias Rápidas:** Acesso direto a Café & Lanches, Almoço & Jantar e Sobremesas.

### 📱 Tela 2: Catálogo de Receitas (Feed Principal)
* **O que mostra:**
  - Barra de pesquisa em tempo real por nome de prato ou ingrediente.
  - Filtros de categoria com badges horizontais (*Todas*, *Café & Lanches*, *Almoço & Jantar*, *Sobremesas Fit*).
  - Botão de filtro por Favoritos (⭐).
  - Grade de cards de receitas contendo: Foto em alta qualidade, tag de tempo de preparo (⏱️ min), badge de proteína em destaque (🍗 g), calorias totais e botão de favoritar com 1 clique.

### 📱 Tela 3: Detalhes da Receita (Modal / Vista Completa)
* **O que mostra:**
  - Imagem de capa em destaque com botão de fechar e favoritar.
  - Título da receita, rendimento (porções) e tempo de preparo.
  - **Tabela Nutricional de Macros:** 4 cards com Calorias (kcal), Proteínas (g), Carboidratos (g) e Gorduras (g).
  - **Lista de Ingredientes:** Checkboxes interativos para o usuário marcar o que já separou, com medidas caseiras e gramas.
  - **Modo de Preparo:** Passo a passo numerado, objetivo e detalhado.
  - **Dica de Ouro do Chef:** Caixa destacada com segredo gastronômico para elevar o sabor.
  - **Botão de Ação:** `➕ Adicionar ao meu consumo de hoje` (integra direto com o Monitor Diário).

### 📱 Tela 4: Ferramenta — Seletor Turbo Protein
* **O que mostra:**
  - Seletor de faixas de proteína:
    - 🟢 *Leve & Prático:* 15g a 25g de proteína
    - 🟡 *Médio & Equilibrado:* 26g a 40g de proteína
    - 🔴 *Super Anabólico:* 41g a 65g+ de proteína
  - Lista filtrada em tempo real com as receitas correspondentes à faixa escolhida.

### 📱 Tela 5: Ferramenta — Radar de Despensa (Modo Geladeira)
* **O que mostra:**
  - Painel de seleção de ingredientes comuns em casa organizados por tags (Ovos, Peito de Frango, Carne Moída, Atum, Iogurte, Leite Desnatado, Queijo Magro, Aveia, Cacau, Banana, etc.).
  - Botão de adicionar ingrediente personalizado.
  - Lista dinâmica de receitas ranqueadas pelo maior número de ingredientes correspondentes.

### 📱 Tela 6: Ferramenta — Semana Blindada Prot+ (Cardápio da Semana)
* **O que mostra:**
  - Seletor de objetivo: *Queima de Gordura*, *Hipertrofia* ou *Recomposição Corporal*.
  - Abas dos 7 dias da semana (Segunda a Domingo).
  - Grade com as 4 refeições planejadas para o dia (Café da Manhã, Almoço, Lanche da Tarde e Jantar).
  - Botão de trocar refeição avulsa.
  - Botão fixo `🛒 Gerar Lista de Compras da Semana` (abre a lista consolidada de itens para o supermercado).

### 📱 Tela 7: Ferramenta — Monitor Diário de Macros (Rastreador)
* **O que mostra:**
  - Configuração de meta de proteína personalizada (em gramas).
  - Gráfico visual de meta batida vs. restante.
  - Lista das receitas consumidas no dia com botão de exclusão individual.
  - Botão de reset diário ou cálculo de meta automático com base no peso corporal.

### 📱 Tela 8: Central de Bônus Exclusivos
* **O que mostra:**
  - Card 1: **Fichas de Treino Prot+** (leitor interativo das divisões de treino e séries).
  - Card 2: **Calculadora Metabólica Prot+** (calculadora interativa com formulário de peso, altura, idade, nível de atividade física e objetivo, gerando TMB, GET e macros na tela).
  - Card 3: **Manual do Whey Caseiro** (guia digital completo com as 5 receitas e comparativo de economia).
