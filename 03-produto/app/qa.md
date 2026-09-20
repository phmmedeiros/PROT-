# QA do aplicativo Prot+

**Última execução:** 20/09/2026 · viewport 390 × 844 px · Chrome headless

## Como rodar

O QA é automatizado. A partir da raiz do projeto:

```bash
node local-preview-server.mjs &
node 03-produto/app/tools/qa-app.mjs
```

O script percorre as 8 telas, executa as interações principais, salva um print de
cada tela em `qa/` e devolve código de saída diferente de zero se qualquer
verificação falhar. Depois da publicação, o mesmo teste roda contra o site real:

```bash
BASE=https://SEU-DOMINIO/app/ node 03-produto/app/tools/qa-app.mjs
```

## Resultado da última execução: 33 verificações, 0 falhas

### Telas (390 × 844)

| Print | Tela |
|---|---|
| `qa/01-inicio.png` | Início / Dashboard |
| `qa/02-receitas.png` | Catálogo de receitas |
| `qa/03-detalhe.png` | Detalhe da receita |
| `qa/04-ferramentas.png` | Índice das ferramentas |
| `qa/05-turbo.png` | Seletor Turbo Protein |
| `qa/06-despensa.png` | Radar de Despensa |
| `qa/07-semana.png` | Semana Blindada |
| `qa/08-monitor.png` | Monitor Diário de Macros |
| `qa/09-bonus.png` | Central de Bônus |
| `qa/10-lista-compras.png` | Lista de compras da semana |
| `qa/11-calculadora.png` | Calculadora metabólica com resultado |
| `qa/12-offline.png` | Receita aberta com a rede desligada |

### Dados e catálogo

- 120 receitas listadas no catálogo.
- Fotos dos cards carregam sob demanda (`loading="lazy"`).
- Busca por "frango" retorna 23 receitas.
- Filtro de categoria Sobremesas retorna 30 receitas.
- Ordenação por proteína verificada do maior para o menor.

### Ferramentas

- Favoritar grava no aparelho e sobrevive à recarga.
- Adicionar ao consumo do dia atualiza a barra do Monitor.
- Meta calculada pelo peso: 70 kg → 126 g por dia.
- Remover item do consumo volta o total a zero.
- Radar de Despensa: selecionar "ovo" gera 20 combinações ranqueadas.
- Semana Blindada: 7 dias × 4 refeições = 28 receitas, nenhuma repetida.
- Trocar refeição avulsa substitui o prato e mantém a escolha salva.
- Lista de compras consolida 29 itens somando as 28 refeições.
- Trocar o objetivo remonta o cardápio inteiro.

### Bônus

- Ficha de treino alterna entre academia e casa (94 exercícios no total).
- Calculadora com 70 kg / 170 cm / 30 anos / feminino / moderado / manter:
  TMB 1452 kcal, gasto total 2250 kcal, 126 g de proteína, 295 g de carboidrato,
  63 g de gordura. Conferido à mão contra Mifflin-St Jeor.

### PWA

- `manifest.json` com 3 ícones (192, 512 e maskable 512).
- Service worker registrado no carregamento.
- Com a rede desligada, o catálogo abre com as 120 receitas e a tela de detalhes
  exibe ingredientes, preparo e a foto já visitada.

### Console

- Nenhum erro de JavaScript.
- Nenhuma requisição com status de erro.

## Observações de publicação

- O app precisa ser servido por HTTP/HTTPS. Aberto por `file://` o navegador
  bloqueia o `fetch` dos dados e o service worker não registra.
- `03-produto/app/` e `03-produto/dados/` precisam manter a posição relativa
  entre si: o app carrega `../dados/receitas.json`.
- As fotos exibidas pelo app são as versões WebP em `images/w400/` e
  `images/w900/`. Os PNGs originais continuam na pasta e servem aos PDFs e à
  página de vendas, mas o app não os carrega.
