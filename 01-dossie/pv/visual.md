# Identidade Visual e Estilos da Página de Vendas (Referência)

**URL de Referência:** `https://www.comersemprebem.shop/receitas-proteicas3`  
**Viewport Mobile:** 390px de largura

---

## 1. Paleta de Cores Principais

### Cores de Destaque & Conversão (Verde / Ação)
- **Verde Principal (Botões e Destaques):** `#8CBC36` (`rgb(140, 188, 54)`) — Utilizado em bordas de cards da oferta, destaques de texto, badges e botões de apoio.
- **Verde Primário / Gradiente CTA:** `linear-gradient(80deg, #25D366 0%, #038434 100%)` — Utilizado nos botões de conversão primários (chamada para o checkout).
- **Verde Escuro / Sombra de Ação:** `#48B404` (`rgba(72, 180, 4, 0.6)`) — Utilizado na sombra projetada (*box-shadow*) dos botões principais para gerar efeito 3D/elevação.
- **Verde Musgo de Fundo:** `#1E2E18` / `#14170B` — Utilizado em blocos de fundo contrastantes.

### Cores Neutras e Estruturais
- **Fundo da Página (Mobile):** `#FFFFFF` (`rgb(255, 255, 255)`).
- **Fundo de Seções Secundárias / Cards:** `#F4F6F8` / `#F7F8FA` / `#F9FAFB` (`rgb(247, 248, 250)`).
- **Bordas e Divisores:** `#E6E8EA` / `#E5E7EB` (`rgb(229, 231, 235)`).
- **Texto Principal (Títulos e Destaques):** `#111827` / `#000000` (`rgb(17, 24, 39)`).
- **Texto Secundário / Corpo de Texto:** `#374151` / `#6B7280` / `#7A7A7A` (`rgb(55, 65, 81)` / `rgb(107, 114, 128)`).

### Cores de Apoio / Alertas / Avaliações
- **Dourado / Amarelo (Estrelas de Avaliação e Selo de Garantia):** `#FBBF24` (`rgb(251, 191, 36)`) e `#C5A059`.
- **Vermelho (Alerta de Escassez / Risco):** `#DC2626` / `#EF4444` com fundo `#FEE2E2`.

---

## 2. Tipografia e Fontes

As seguintes fontes do Google Fonts são importadas e utilizadas no projeto:

### 1. **Roboto** (`sans-serif`)
- **Uso:** Corpo de texto principal, parágrafos, textos de suporte, listas de benefícios e textos de botões principais.
- **Pesos utilizados:** 400 (Regular), 500 (Medium), 600 (Semi-bold), 800 (Extra-bold).
- **Tamanhos comuns (Mobile 390px):**
  - Parágrafos: `15px` - `16px` (Line-height: `1.4` - `1.6`)
  - Subtextos / Badges / Meta: `13px` - `14px`

### 2. **Poppins** (`sans-serif`)
- **Uso:** Títulos principais (H1, H2, H3), subtítulos de seção e títulos de cards de destaque.
- **Pesos utilizados:** 600 (Semi-bold), 700 (Bold), 800 (Extra-bold), 900 (Black).
- **Tamanhos comuns (Mobile 390px):**
  - H1 (Headline principal): `26px` - `32px` (Line-height: `1.2` - `1.3`)
  - H2 (Títulos de blocos/seções): `22px` - `26px`
  - H3 (Títulos de cards/bônus): `18px` - `20px`

### 3. **Montserrat** / **Arial** (`sans-serif`)
- **Uso:** Botões secundários (`a.a-btn`), preços em caixa alta e chamadas de ênfase.
- **Pesos utilizados:** 600 (Semi-bold), 800 (Bold).

### 4. **Space Grotesk** (`sans-serif`)
- **Uso:** Botões nativos e detalhes de navegação interativa.

---

## 3. Estilo dos Botões e Elementos Interativos

### A. Botão de Conversão Primário (CTA Checkout)
- **Texto:** `👉 QUERO AS RECEITAS COM OS BÔNUS!`
- **Tag:** `<a class="a-btn ...">`
- **Fundo:** `linear-gradient(80deg, #25D366 0%, #038434 100%)` (Degradê verde vivo).
- **Cor do Texto:** `#FFFFFF` (Branco).
- **Tipografia:** `Roboto, sans-serif`, tamanho `20px`, peso `800` (Extra-bold).
- **Borda:** Sem borda (`border: 0px hidden`).
- **Arredondamento:** `border-radius: 16px`.
- **Espaçamento Interno:** `padding: 15px 12px` (Largura quase total no mobile ~90-95% da tela).
- **Sombra:** `box-shadow: 0px 7px 10px 0px rgba(72, 180, 4, 0.6)`.
- **Animação de Atenção:**
  ```css
  animation: atomicat-animation-zoomInOut 2s infinite linear;

  @keyframes atomicat-animation-zoomInOut {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  ```

### B. Botão de Ação Secundário (Âncora de Rolagem `#ofert`)
- **Textos:** `QUERO AS RECEITAS PROTEICAS`, `OK, VOCÊ ME CONVENCEU QUERO ESSAS DELÍCIAS 🤤`, `QUERO APROVEITAR OS BÔNUS`.
- **Fundo:** `#8CBC36` (Verde sólido).
- **Cor do Texto:** `#FFFFFF`.
- **Tipografia:** `Arial, sans-serif`, tamanho `16px`, peso `600`.
- **Arredondamento:** `border-radius: 22px` (estilo pílula).
- **Espaçamento Interno:** `padding: 12px 20px`.
- **Sombra:** `box-shadow: 0px 6px 8px -2px rgba(0, 0, 0, 0.35)`.
- **Animação:** `atomicat-animation-zoomInOut 2s infinite linear`.

### C. Botão Invertido (Fundo Branco / Borda Verde)
- **Texto:** `QUERO LIBERAR MEU ACESSO AGORA MESMO`
- **Fundo:** `#FFFFFF`.
- **Cor do Texto:** `#8CBC36`.
- **Arredondamento:** `border-radius: 22px`.
- **Espaçamento Interno:** `padding: 12px 20px`.
- **Sombra:** `box-shadow: 0px 6px 8px -2px rgba(0, 0, 0, 0.35)`.

---

## 4. Estilo dos Cards e Elementos Visuais

- **Cards de Receitas / Demonstração:**
  - Fundo branco (`#FFFFFF`), bordas suaves arredondadas (`border-radius: 12px`), sombra leve (`box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)`), imagem centralizada no topo e badge de destaque para tempo e proteína.
- **Box da Oferta Principal:**
  - Borda sólida verde `#8CBC36` (`border: 2px solid #8CBC36`), cantos arredondados (`border-radius: 16px`), fundo claro e sombra destacada (`box-shadow: 0 0 12px -2px rgba(0,0,0,0.15)`).
- **Acordeão de FAQ:**
  - Fundo dos itens `#F7F8FA`, bordas arredondadas `10px`, espaçamento entre itens `12px`, padding interno `15px 20px`, ícone de seta expansível no lado direito.
