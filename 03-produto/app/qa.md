# QA do Prot+ — Fase 3.2

## Resultado

- Servido em HTTP a partir de `03-produto/`, com entrada em `/app/`.
- Viewport testada: `390 × 844 px`.
- JSON carregado: 120 receitas.
- Navegação testada: início, catálogo, detalhe da receita, ferramentas e bônus.
- Erros de JavaScript e console: nenhum.
- Service worker registrado durante o carregamento.
- Cards e detalhe exibem o marcador `foto reservada - nome da receita`, conforme orientação do roteiro até a definição da origem das fotos.

## Prints

- `qa/01-home-390.png` — início/dashboard.
- `qa/02-recipes-390.png` — catálogo e filtros.
- `qa/03-detail-390.png` — detalhe da receita.
- `qa/04-tools-390.png` — ferramentas e monitor.
- `qa/05-bonus-390.png` — central de bônus.

## Observação de publicação

O app deve ser publicado mantendo `03-produto/app/` e `03-produto/dados/` no mesmo nível. O carregamento usa `../dados/receitas.json`; abrir o `index.html` diretamente via `file://` não é suportado por causa das regras de segurança do navegador para `fetch`.
