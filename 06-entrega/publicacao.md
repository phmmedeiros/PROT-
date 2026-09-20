# Guia de publicação e entrega — Prot+

## Status

Este documento prepara a publicação, mas nenhum site, domínio, checkout ou conta externa foi alterado. A publicação depende da confirmação do responsável, dos acessos de hospedagem e da URL definitiva do checkout.

## 1. Estrutura para hospedagem

Publicar mantendo esta estrutura relativa:

```text
03-produto/
├── app/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── manifest.json
│   ├── service-worker.js
│   ├── images/
│   │   ├── icons/        ícones do app instalado (obrigatórios)
│   │   ├── w400/         fotos dos cards (2,8 MB)
│   │   ├── w900/         fotos da tela de detalhes (12,3 MB)
│   │   └── *.png         originais: usados pelos PDFs, não pelo app
│   ├── tools/            scripts de manutenção, não precisam ir ao ar
│   └── qa/               prints do QA, não precisam ir ao ar
└── dados/
    ├── receitas.json
    ├── dicas-chef.json
    ├── bonus.json
    └── calculo-macros.md
```

O app deve ser servido por HTTP/HTTPS, não aberto diretamente por `file://`. O arquivo `app/app.js` carrega `../dados/receitas.json`, `../dados/dicas-chef.json` e `../dados/bonus.json`: os três precisam subir junto.

As pastas `images/w400/` e `images/w900/` são obrigatórias — são as fotos que o app exibe. Os PNGs originais (279,5 MB) podem ficar fora do servidor para economizar espaço; o app só recorre a eles se a versão WebP faltar. Se optar por não publicá-los, confirme antes que `images/w400/` e `images/w900/` têm 120 arquivos cada.

O servidor precisa entregar `.webp` com o tipo MIME `image/webp` e `.json` com `application/json`.

## 2. Publicação do app

1. Criar uma pasta pública para o app no servidor.
2. Enviar `03-produto/app/` e `03-produto/dados/` preservando a relação entre as pastas.
3. Confirmar que `app/index.html` abre por HTTPS.
4. Confirmar que `dados/receitas.json` responde com status 200.
5. Abrir o app uma vez e verificar o registro do service worker.
6. Rodar o QA automatizado contra a URL publicada:
   `BASE=https://SEU-DOMINIO/app/ node 03-produto/app/tools/qa-app.mjs`
7. Testar a instalação na tela inicial em Android e iPhone.
8. Com o app instalado, ligar o modo avião e confirmar que o catálogo abre.

## 3. Publicação da página de vendas

Enviar o conteúdo de `04-pagina/` para o diretório público da página:

```text
04-pagina/
├── index.html
├── style.css
├── script.js
└── qa/pagina-390.png
```

Antes de publicar, substituir ou aprovar os seguintes marcadores:

- `[PROVA REAL AQUI]` por provas próprias, autorizadas e verificáveis;
- `[DATA DA OFERTA AQUI]` pela data real da campanha;
- CTAs internos pela URL real do checkout;
- placeholders de imagens por fotos próprias ou licenciadas.

## 4. Checkout e esteira

Configurar na Payt, plataforma de checkout escolhida para esta oferta:

- Produto principal: Prot+ — R$ 27,50, pagamento único.
- Garantia: 45 dias, conforme termos aprovados.
- Campos: nome, e-mail, celular e CPF/CNPJ, se exigidos pela plataforma.
- Pagamentos: PIX, cartão e carteiras digitais disponíveis na conta.
- Order bump 1: Marmitas Proteicas — R$ 7,89.
- Order bump 2: Receitas na Air Fryer — R$ 7,89.
- Order bump 3: Saladas Proteicas + Molhos — R$ 9,90.
- Upsell: somente configurar após confirmação da oferta, preço, copy e URL.

Não usar nomes, promessas ou links da operação de referência sem aprovação específica.

## 5. E-mail de entrega

O e-mail pós-compra deve conter:

1. Confirmação do acesso.
2. Botão para abrir o app.
3. Instrução para adicionar à tela inicial.
4. Orientação para abrir o app pelo navegador na primeira visita.
5. Canal de suporte definido pelo responsável.

Texto-base:

> Seu acesso ao Prot+ foi liberado. Abra o aplicativo pelo botão abaixo. Na primeira visita, aguarde o carregamento completo; depois use a opção “Adicionar à tela inicial” do seu navegador para consultar suas receitas com mais facilidade.

## 6. Variáveis ainda pendentes

| Variável | Estado |
|---|---|
| URL real do checkout | `[CONFIGURAR]` |
| Domínio da página | `[CONFIGURAR]` |
| Domínio ou caminho final do app | `[CONFIGURAR]` |
| E-mail remetente | `[CONFIGURAR]` |
| Canal de suporte | `[CONFIGURAR]` |
| Pixel e eventos | `[CONFIGURAR]` |
| Data promocional | `[CONFIGURAR]` |
| Termos e privacidade | `[CONFIGURAR]` |

## 7. Regra de publicação

Nada deve ser publicado até que o responsável confirme domínio, checkout, garantia, provas, imagens, e-mail de entrega e textos legais.
