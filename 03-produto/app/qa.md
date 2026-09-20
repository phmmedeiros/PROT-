# QA do aplicativo Prot+

**Última execução:** 20/09/2026 · viewport 390 × 844 px · Chrome headless
**Resultado:** 63 verificações, 0 falhas — **em produção** (`https://app.comersemprebem.site`) e local

## Como rodar

```bash
node local-preview-server.mjs &
source 03-produto/supabase/.qa-credenciais
node 03-produto/app/tools/qa-app.mjs                                   # local
BASE=https://app.comersemprebem.site/ node 03-produto/app/tools/qa-app.mjs   # produção
```

`.qa-credenciais` fica fora do Git. Se o DNS novo ainda não propagou no seu
provedor, `FORCAR_IP=<ip>` manda o Chrome direto ao servidor.

**Depois de um deploy, espere o CDN.** O deploy é assíncrono; rodar a suíte
segundos depois testa a versão anterior. Limpe o cache do CDN e confirme com
`curl https://app.comersemprebem.site/app.js | grep painel-lembrete` antes.

## O que é verificado

### Portaria e primeiro acesso
- Sem sessão: tela de entrada, nunca o catálogo.
- Conta de teste entra; dados zerados (inclusive peso, boas-vindas, lembrete e assinaturas push).
- Primeiro acesso mostra as boas-vindas e esconde o app; prévia da meta ao digitar; 70 kg → 126 g gravados; marcadas como vistas; não repetem.

### Início
- Convite para instalar aparece uma vez; "Agora não" some e não volta.
- Nome pelo campo na tela grava no banco e aparece no cabeçalho.
- Link "Precisa de ajuda?" presente.
- Compradora não é administradora e não vê a tarja.

### Telas (prints em `qa/`)
`00-login`, `01-inicio`, `02-receitas`, `03-detalhe`, `04-ferramentas`, `05-turbo`,
`06-despensa`, `07-semana`, `08-monitor`, `09-bonus`, `11-calculadora`, `12-sem-internet`.

### Receita (cozinhando com o celular)
- Botão de registrar preso na base da tela.
- 2 porções dobra os ingredientes (120 g → 240 g) e mantém macros por porção (341 kcal).
- Toque marca o passo atual, segundo toque desmarca, sem rolar a tela para o topo.

### Catálogo e sincronização (conferida no banco)
- 120 receitas; busca "frango" = 23; sobremesas = 30.
- Favorito, meta pelo peso, consumo, cardápio (28 refeições, nenhuma repetida), despensa e ingrediente digitado gravam e voltam do servidor.
- "Comi" no cardápio grava no consumo e muda de estado na tela.
- Lista de compras: marcar risca, sobrevive a fechar/reabrir, "Desmarcar tudo" limpa.

### Lembrete diário (Web Push)
- Painel no Monitor com 24 horas.
- Ligar às 15h grava `lembrete_hora` e uma assinatura push (o Chrome assina de verdade).
- Desligar limpa hora e assinatura.
- Sem serviço de push, o app avisa e **não** grava a hora — nunca promete lembrete que não chega.

### Persistência, isolamento, bônus, PWA, rede, console
- Cache local apagado → dados voltam do servidor. Sair apaga o cache e volta ao login.
- Ficha de treino, calculadora (TMB 1452 / 2250 / 126 g).
- Manifest com 3 ícones; service worker (v5) registrado.
- Sem internet: "Sem conexão", reabre sozinho ao voltar a rede.
- Nenhum erro de JavaScript, nenhuma requisição com erro.
