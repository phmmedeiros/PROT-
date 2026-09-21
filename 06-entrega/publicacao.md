# Guia de publicação e entrega — Prot+

## Status

Publicação realizada com sucesso na Hostinger em 20/09/2026:
- Domínio principal: `https://comersemprebem.site/` (redireciona para o subdomínio `lp`)
- Página de vendas: `https://lp.comersemprebem.site/`
- Aplicativo PWA: `https://app.comersemprebem.site/` — **endereço único e oficial do app**
  (em 21/09/2026 a cópia em `lp.comersemprebem.site/app/` foi aposentada: manter duas
  publicações do mesmo app significava manter duas versões, e uma delas ficava para trás)
- Certificado SSL ativo (hSSL Lifetime) e QA automatizado com 33 testes aprovados sem falhas.

## 0.1 Endereço único do app e o `.htaccess` da `lp` (21/09/2026)

O app é servido **apenas** por `https://app.comersemprebem.site`. A cópia antiga
que mora em `/app` dentro da hospedagem da `lp` ficou na versão `v5` e não deve
mais receber ninguém — **mas os arquivos dela continuam servindo as imagens da
página de vendas** (`/app/images/w400/*.webp`). Apagar a pasta quebraria a página.

Por isso o `.htaccess` da `lp` redireciona só a porta de entrada, e nada abaixo dela:

```apache
RewriteRule ^app/?$ https://app.comersemprebem.site/ [R=301,L]
RewriteRule ^app/index\.html$ https://app.comersemprebem.site/ [R=301,L]
```

Quem tiver o endereço antigo salvo na tela inicial cai no app certo; as imagens
da página seguem locais. O `.htaccess` não é versionado: ele vive no servidor,
e esta seção é o registro do que há nele.

## 0. Estado da publicação (20/09/2026)

| O quê | Onde | Estado |
|---|---|---|
| Aplicativo | `https://app.comersemprebem.site` | **no ar** (`v6`, publicado em 21/09/2026). É o único endereço do app. |
| Página de vendas | `https://lp.comersemprebem.site` | **no ar**, incluindo a `obrigado.html` revisada em 21/09/2026 |
| Banco e login | Supabase `Prot+` (`sa-east-1`) | no ar |
| E-mail | Resend, domínio verificado | falta ligar o SMTP na Supabase |
| Checkout | Payt | URL já na página; webhook ainda não publicado |

### Como republicar o aplicativo

```bash
cd 03-produto/app
python3 tools/preparar-publicacao.py      # gera dist/prot-plus-AAAAMMDD_HHMMSS.zip
```

Depois subir o `.zip` pelo painel da Hostinger em `app.comersemprebem.site`, ou
pedir para o agente publicar. O pacote leva só o necessário (15,3 MB): código,
dados, ícones e as fotos WebP. Os PNGs originais (280 MB) ficam de fora — o app
não os usa.

**Depois de publicar, limpar o cache do CDN** (painel da Hostinger > site >
Limpar cache). Sem isso, o navegador pode receber a versão anterior por alguns
minutos — o deploy é assíncrono e o CDN só troca os arquivos quando propaga.
O agente faz a limpeza automaticamente ao publicar; a mão, é esse botão.

O app roda na RAIZ do subdomínio, com os JSON numa pasta `dados/` ao lado do
`index.html`. O caminho `../dados/` do código continua valendo porque o
navegador não deixa `..` subir acima da raiz.

### ⚠️ Antes de publicar a página de vendas

40 das 50 imagens de `04-pagina/index.html` apontam para
`../03-produto/app/images/*.png`. Publicada em `lp.comersemprebem.site`, essa
rota sobe acima da raiz do site e as 40 fotos quebram.

Duas saídas:

1. Copiar as fotos para `04-pagina/images/` e trocar os caminhos para
   `images/NOME.png`. Use as versões WebP (`03-produto/app/images/w900/`):
   pesam cerca de 5 MB no total, contra 100 MB dos PNGs.
2. Apontar para o app, que já as serve publicamente:
   `https://app.comersemprebem.site/images/w900/AJ-001.webp`.

A opção 1 deixa a página independente do app; a 2 evita duplicar arquivo.

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
│   ├── config.js         endereco e chave publica do Supabase
│   ├── conta.js          login, portaria de acesso e sincronizacao
│   ├── vendor/           cliente Supabase (hospedado por nos, sem CDN)
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
8. Conferir no painel da Supabase que o endereço publicado está na lista de
   Redirect URLs — sem isso o link mágico não devolve a pessoa ao app.
9. Confirmar que o SMTP próprio está configurado: o envio nativo da Supabase
   é limitado a poucos e-mails por hora e trava o lançamento.

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
- URL do Checkout Ativo: `https://checkout.payt.com.br/8b77902c47ab4ecdabdcd7909b342ad9`
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
| Domínio da página | `https://lp.comersemprebem.site/` |
| Domínio ou caminho final do app | `https://app.comersemprebem.site/` |
| E-mail remetente | `[CONFIGURAR]` |
| Canal de suporte | `[CONFIGURAR]` |
| Pixel e eventos | `[CONFIGURAR]` |
| Data promocional | `[CONFIGURAR]` |
| Termos e privacidade | `https://lp.comersemprebem.site/termos.html` / `privacidade.html` |

## 7. Regra de publicação

Nada deve ser publicado até que o responsável confirme domínio, checkout, garantia, provas, imagens, e-mail de entrega e textos legais.
