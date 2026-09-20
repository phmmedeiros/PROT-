# Supabase do Prot+ — o que precisa ser feito no painel

O acesso ao app é por **link mágico**: a pessoa digita o e-mail e recebe um link
de entrada. Não existe senha.

Entram duas categorias de pessoa:

- **Administradores** (Paulo e Pedro), sem compra, listados em `administradores`.
- **Compradoras**, com uma compra ativa em `compras`.

O que impede o produto de virar link aberto é a combinação de três coisas:

1. **Cadastro público desligado** — ninguém cria conta sozinho.
2. **O webhook da Payt cria o usuário** — o único caminho de entrada é a compra.
3. **A função `tenho_acesso()`** — checada a cada abertura; reembolso corta.

Se qualquer uma das três falhar, qualquer pessoa entra.

---

## ⚠️ O item que derruba o lançamento se passar batido

**O envio de e-mail nativo da Supabase não serve para produção.** Ele é limitado a
poucos e-mails por hora e existe só para desenvolvimento. Num lançamento com
tráfego pago, a partir da quarta ou quinta compra os links mágicos simplesmente
param de chegar — e cada link que não chega é um cliente que pagou e não entrou.

**Antes de qualquer venda real, configure o SMTP do Resend** (escolhido para
esta operação). O passo a passo está em `resend.md`, nesta mesma pasta.

---

## 1. Aplicar o banco

Pelo SQL Editor do painel, cole e execute o conteúdo de:

```
migrations/0001_esquema_inicial.sql
```

Cria as tabelas `compras`, `perfis`, `favoritos`, `despensa`, `consumo` e
`semanas`, com RLS ligado em todas e a função `tenho_acesso()`.

Depois, confirme em `Database > Tables` que **todas** aparecem com RLS ativo.
Uma tabela sem RLS numa base com chave pública no navegador é dado exposto.

## 1b. Acesso administrativo

`migrations/0003_acesso_administrativo.sql` cria a tabela `administradores` com
`phenrimedeiros@gmail.com` e `pedro.arqtt@gmail.com`, e ensina `tenho_acesso()`
a aceitar dois caminhos: ser administrador **ou** ter compra ativa.

Os dois entram por link mágico, como qualquer cliente, mas sem precisar comprar.
O app mostra uma tarja laranja de "sessão de administrador" para não confundirem
o que veem com o que a cliente vê.

**Admin não entra em `compras` de propósito.** Se entrasse, todo relatório de
vendas contaria vocês dois como clientes.

Para adicionar ou remover um administrador, pelo SQL Editor:

```sql
insert into public.administradores (email, nome) values ('novo@exemplo.com', 'Nome');
delete from public.administradores where email = 'saiu@exemplo.com';
```

O e-mail precisa estar em minúsculas (há uma trava no banco garantindo isso) e a
pessoa precisa ter uma conta em `Authentication > Users` para o link mágico ter
destino. As contas de Paulo e Pedro já foram criadas.

## 2. Desligar o cadastro público

`Authentication > Sign In / Up > Email`:

- Manter o provedor **Email** ligado.
- **Desligar** "Allow new users to sign up".

Sem isso, qualquer pessoa digita um e-mail, recebe o link e entra sem ter pago.

## 3. Endereços de retorno

`Authentication > URL Configuration`:

- **Site URL:** `https://app.comersemprebem.site`
- **Redirect URLs:** adicionar as duas
  - `https://app.comersemprebem.site` — endereço real, já no ar
  - `http://127.0.0.1:4174/app/` — para o QA local

O app monta o endereço de retorno a partir de onde ele mesmo está rodando
(`location.origin + location.pathname`), então esses dois valores cobrem tanto o
site publicado quanto o teste na máquina.

O link mágico só funciona se o endereço de destino estiver nessa lista.

## 4. Texto do e-mail em português

`Authentication > Emails > Templates > Magic Link`. O texto padrão vem em inglês
e com cara de ferramenta técnica. Sugestão:

**Assunto:** `Seu acesso ao Prot+`

```html
<h2>Seu acesso ao Prot+</h2>
<p>Toque no botão abaixo para abrir o aplicativo. O link vale por 1 hora e só
   pode ser usado uma vez.</p>
<p><a href="{{ .ConfirmationURL }}">Abrir o Prot+</a></p>
<p>Se você não pediu este acesso, ignore este e-mail.</p>
```

## 5. Duração da sessão

`Authentication > Sessions`. O padrão desloga rápido demais para um app de
receitas — a pessoa não quer pedir link novo toda vez que abre na cozinha.
Sugestão: **refresh token de 30 dias**, sem expiração por inatividade.

## 6. Segredos da Edge Function

`Edge Functions > Secrets`, adicionar:

| Nome | Para quê | Onde está o valor |
|---|---|---|
| `PAYT_WEBHOOK_SECRET` | autentica o webhook da Payt | `.segredos` |
| `CRON_SECRET` | autentica a chamada agendada dos lembretes | `.segredos` |
| `VAPID_PUBLIC_KEY` | par de chaves do Web Push (a pública também está em `app/config.js`) | `.segredos` |
| `VAPID_PRIVATE_KEY` | idem — **nunca** vai para o app | `.segredos` |

Os quatro estão em `03-produto/supabase/.segredos`, fora do Git.

**Onde as funções os leem:** primeiro no ambiente (esta tela do painel); se
não houver, no **Vault** do banco, via `public.segredo(nome)`, que só o
`service_role` consegue chamar. Os valores foram gravados no Vault pelo agente
em 20/09/2026 (migration `0006`), então **cadastrar no painel é opcional** —
se cadastrar, o ambiente tem prioridade.

Para trocar um segredo no Vault: `Settings > Vault` no painel, ou por SQL:
```sql
select vault.update_secret(id, 'novo-valor') from vault.secrets where name = 'NOME';
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já vêm preenchidos pela própria
Supabase — não precisa criar, e **nunca** devem aparecer no código do app.

## 7. Webhook — publicado em 20/09/2026 (versão 2)

A função `payt-webhook` está no ar com `verify_jwt` desligado (quem chama é a
Payt, sem sessão de usuário; a autenticação é o segredo compartilhado).

O que ela faz numa compra aprovada, nesta ordem:

1. Registra o pedido em `compras` (reenvio da Payt não duplica: `pedido_payt` é único).
2. Cria a conta em `Authentication > Users`, já confirmada.
3. **Envia o link de acesso por e-mail na hora**, pelo mesmo modelo e SMTP do
   login normal. A pessoa paga e recebe o e-mail *Seu acesso ao Prot+* sem
   precisar descobrir o endereço do app.

Reembolso, chargeback e cancelamento só mudam o status em `compras`; o acesso
cai na próxima abertura do app. Eventos intermediários (pix gerado, boleto
emitido) são ignorados.

Se o e-mail falhar (por exemplo, limite de envio), a compra e a conta ficam
gravadas mesmo assim e a resposta continua 200 — devolver erro faria a Payt
reenviar e duplicar. O campo `email_enviado` na resposta e o log da função
mostram o que houve.

### Endereço para colar na Payt

Para montar a URL sem digitar o segredo à mão:

```bash
source 03-produto/supabase/.segredos
echo "https://zhbvlqlkdpbtqvctrerw.supabase.co/functions/v1/payt-webhook?secret=$PAYT_WEBHOOK_SECRET"
```

**Eventos a marcar na Payt:** compra aprovada/paga, reembolso, chargeback e
cancelamento.

### Estado verificado sem o segredo no painel

| Tentativa | Resposta |
|---|---|
| POST sem segredo | 500, recusado |
| POST com segredo errado | 500, recusado |
| GET (varredura automática) | 405 |

Nenhuma compra foi criada por essas tentativas. Depois de cadastrar
`PAYT_WEBHOOK_SECRET` no painel, as duas primeiras passam a responder **401**.

### Testar sem compra real

Com o segredo cadastrado, simule uma compra aprovada para um endereço seu:

```bash
source 03-produto/supabase/.segredos
curl -X POST "https://zhbvlqlkdpbtqvctrerw.supabase.co/functions/v1/payt-webhook?secret=$PAYT_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"email":"seu+teste@gmail.com","order_id":"TESTE-001","status":"paid","amount":27.5,"name":"Teste"}'
```

Esperado: `{"ok":true,"status":"ativo","novo":true,"email_enviado":true}`, uma
linha em `compras`, a conta em `Authentication > Users` e o e-mail de acesso
na caixa de entrada. Clicar no link deve abrir o app já dentro.

**O e-mail de entrega da Payt** (`06-entrega/payt-configuracao.md`, seção 3)
vira complementar: em vez de ensinar a pedir o link, deve dizer "procure na
caixa de entrada o e-mail *Seu acesso ao Prot+* e toque no botão".

### Para republicar depois de editar a função

```bash
supabase functions deploy payt-webhook --no-verify-jwt
```

## 8. Conferir com uma compra de teste

1. Fazer a compra de teste na Payt (com autorização).
2. Abrir `Table Editor > compras` e ver a linha criada.
3. Abrir a coluna `payload_bruto` e comparar com os nomes de campo lidos em
   `functions/payt-webhook/index.ts`. Se a Payt usar nomes diferentes dos que
   testamos, ajustar as listas `CAMPOS_*` e publicar de novo.
4. Abrir `Authentication > Users` e confirmar que o usuário foi criado.
5. Entrar no app com aquele e-mail e conferir que o link mágico chega.
6. Testar o corte: mudar o `status` da compra para `reembolsado` na mão e
   confirmar que o app bloqueia na próxima abertura.

---

## 9. Conta de teste do QA

Existe uma conta `qa@prot.teste` com uma compra ativa de teste
(`pedido_payt = 'QA-TESTE-001'`). Ela entra por **senha**, e não por link mágico,
apenas porque um teste automatizado não consegue abrir e-mail. O domínio
`.teste` não existe de verdade, então ninguém recebe e-mail nesse endereço.

A senha fica em `03-produto/supabase/.qa-credenciais`, fora do Git.

Antes de ligar o tráfego, decida: manter a conta (útil para rodar o QA contra o
site publicado) ou apagá-la. Para apagar:

```sql
delete from auth.users where email = 'qa@prot.teste';
delete from public.compras where pedido_payt = 'QA-TESTE-001';
```

## 10. Avisos conhecidos do verificador de segurança

Rodando `Advisors > Security` no painel, dois avisos aparecem e ambos estão
avaliados:

- **`tenho_acesso()` é chamável por usuários logados.** É intencional: essa é a
  checagem de acesso do app. A função devolve apenas um booleano sobre o próprio
  e-mail de quem chama, sem expor dado de ninguém.
- **Proteção contra senha vazada desligada.** Só faz diferença para contas com
  senha, e a única é a de teste. Se um dia o login por senha for oferecido às
  compradoras, ligue a opção em `Authentication > Policies`.

## 11. Lembrete diário (Web Push)

A pessoa liga o lembrete no Monitor e escolhe a hora. A cada hora cheia o
`pg_cron` chama a Edge Function `enviar-lembretes`, que notifica só quem tem
lembrete naquela hora **e ainda não registrou nada no dia**. Quem já registrou
não é incomodado.

**Estado (20/09/2026):** função publicada, cron agendado (`prot-plus-lembretes`,
`0 * * * *`, ativo), tabela `push_assinaturas` criada, app com o painel no
Monitor. **Falta cadastrar `CRON_SECRET`, `VAPID_PUBLIC_KEY` e
`VAPID_PRIVATE_KEY`** no passo 6 — até lá a função responde 500 a cada hora e
nenhum lembrete sai, mesmo que a pessoa ligue no app.

### Testar depois de cadastrar os segredos

Envia agora para uma pessoa, ignorando hora e consumo. Ela precisa ter ligado
o lembrete no app ao menos uma vez neste aparelho, para existir uma assinatura.

```bash
source 03-produto/supabase/.segredos
curl -X POST https://zhbvlqlkdpbtqvctrerw.supabase.co/functions/v1/enviar-lembretes \
  -H "Content-Type: application/json" -H "x-cron-secret: $CRON_SECRET" \
  -d '{"forcar_usuario":"<uuid da pessoa, em Authentication > Users>"}'
```

Resposta esperada: `{"hora":..,"avaliados":1,"enviados":1,"removidos":0}`.
`removidos` sobe quando o navegador cancelou a assinatura (404/410) ou após
três falhas seguidas — o app pede uma nova na próxima vez que a pessoa ligar.

### Acompanhar o agendamento

```sql
select jobname, schedule, active from cron.job;
select start_time, status, return_message from cron.job_run_details
 order by start_time desc limit 20;
```

### Limitações honestas

- **iPhone:** só recebe push se o Prot+ estiver instalado na tela inicial
  (iOS 16.4+). No Safari comum, o painel avisa isso e não oferece a opção.
- A assinatura é do navegador, não da conta: ao sair, o app a cancela para o
  lembrete não chegar em nome de outra pessoa no mesmo aparelho.

---

## O que fica de fora do banco

As 120 receitas, as fotos e o conteúdo dos bônus continuam em arquivos estáticos
(`03-produto/dados/*.json` e `03-produto/app/images/`). Não há motivo para
colocá-los no Postgres: são iguais para todo mundo, não mudam por usuário e em
arquivo carregam mais rápido e de graça.

O banco guarda só o que é da pessoa: quem comprou, favoritos, meta de proteína,
consumo do dia, despensa e cardápio da semana.
