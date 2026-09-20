# Envio de e-mail do Prot+ pelo Resend

Todo acesso ao app passa por um e-mail: a pessoa digita o endereço, recebe o
link mágico e entra. **E-mail que não chega é cliente que pagou e não entrou.**
Por isso esta configuração vem antes de qualquer venda.

O envio nativo da Supabase não serve: é limitado a poucos e-mails por hora e
existe só para desenvolvimento.

---

## Estado atual: configurado e testado (20/09/2026)

- Domínio `comersemprebem.site`: **verified**, região `sa-east-1` (São Paulo).
- DKIM, SPF (CNAMEs `send` e `rsend`) e DMARC publicados e propagados.
- Chave DKIM validada: decodifica e é uma chave pública RSA bem-formada.
- Envio real testado para `phenrimedeiros@gmail.com`: **delivered**.

Falta apenas ligar o SMTP na Supabase (passo 4) e ajustar o limite de envio.

Registros publicados no DNS, junto com os do site (que seguem intactos):

| Nome | Tipo | Conteúdo |
|---|---|---|
| `resend._domainkey` | TXT | chave DKIM (RSA 1024 bits, validada) |
| `send` | CNAME | `send.forge.rmta.net` |
| `rsend` | CNAME | `rsend-sae1.forge.rmta.net` |
| `_dmarc` | TXT | `v=DMARC1; p=none;` |
| `@`, `www`, `lp`, `ftp` | — | registros do site, não alterados |

Os alvos `forge.rmta.net` não têm registro A de propósito: eles carregam MX e
SPF para tratar retorno de e-mail, não tráfego web.

> **Não adicione um registro SPF na raiz do domínio.** Nesse desenho, o SPF é
> herdado pelo CNAME `send` e o alinhamento do DMARC vem pelo DKIM. Um `v=spf1`
> na raiz pode quebrar o que está funcionando.

---

## 1. Criar a conta e o domínio no Resend

1. Criar conta em `resend.com`.
2. `Domains > Add Domain`.
3. Usar o domínio raiz **`comersemprebem.site`**.

   O fluxo atual do Resend já cria os subdomínios `send` e `rsend` por CNAME
   para cuidar do envio e do retorno, então a separação de reputação acontece
   sozinha — não é preciso cadastrar um subdomínio à mão.

4. Escolher `sa-east-1` (São Paulo), mais perto do público brasileiro.

O Resend vai exibir três ou quatro registros DNS: um MX, um TXT de SPF, um TXT
de DKIM e, às vezes, um DMARC.

## 2. Publicar os registros no DNS

O DNS de `comersemprebem.site` é gerenciado pela Hostinger.

Já publicados. Mantido aqui como referência caso precisem ser refeitos.

Em `Hostinger > Domínios > DNS`:

| O que o Resend chama de | Tipo | Nome a usar na Hostinger |
|---|---|---|
| `send.comersemprebem.site` | CNAME | `send` |
| `rsend.comersemprebem.site` | CNAME | `rsend` |
| `resend._domainkey.comersemprebem.site` | TXT (DKIM) | `resend._domainkey` |
| `_dmarc.comersemprebem.site` | TXT (DMARC) | `_dmarc` |

A Hostinger costuma pedir o nome **sem** o domínio no final. Colar
`send.comersemprebem.site` no campo de nome cria
`send.comersemprebem.site.comersemprebem.site`, que não funciona e é difícil de
perceber depois.

Depois de salvar, voltar ao Resend e clicar em **Verify**. A propagação leva de
minutos a algumas horas.

## 3. Credenciais SMTP

| Campo | Valor |
|---|---|
| Host | `smtp.resend.com` |
| Porta | `465` |
| Usuário | `resend` |
| Senha | a API Key do Resend |

A chave fica em `.segredos`, nesta pasta, fora do Git.

## 4. Ligar na Supabase

`Authentication > Emails > SMTP Settings`:

- **Enable Custom SMTP:** ligado
- **Sender email:** `acesso@comersemprebem.site`
- **Sender name:** `Prot+`
- Host, porta, usuário e senha do passo 3

### ⚠️ E o limite que quase todo mundo esquece

Configurar o SMTP **não basta**. A Supabase tem um limite próprio de envio de
e-mails de autenticação, independente do Resend, e ele costuma vir baixo (na
casa de 30 por hora).

Sem mexer nisso, o gargalo só muda de lugar: o Resend aguenta o volume, mas a
Supabase para de enviar — e sem erro visível para você.

Ajuste em **`Authentication > Rate Limits`**, no campo de e-mails por hora, para
um número compatível com a projeção do lançamento.

## 5. Endereço de resposta

Como o domínio não recebe e-mail, configure um `Reply-To` que funcione — o
e-mail de suporte que vocês já usam. Sem isso, quem responder ao link mágico
recebe um erro de entrega, e essa pessoa provavelmente vai pedir reembolso em
vez de insistir.

## 6. Limite do plano

O plano gratuito do Resend trabalha na casa de **100 e-mails por dia**
(confirme o número atual no painel, que muda com o tempo).

A conta que importa: **cada entrada no app gasta um e-mail.** Não é um por
cliente — é um por login. Com sessão de 30 dias, uma cliente gasta pouco, mas
no dia do lançamento cada compra nova gasta pelo menos um.

Isto é: o plano gratuito limita o lançamento a algo perto de 100 acessos novos
por dia. Se a projeção de vendas passar disso, o plano pago precisa estar ativo
**antes** de ligar o tráfego, não depois de os e-mails começarem a falhar.

## 7. Conferir antes de vender

1. Enviar um e-mail de teste pelo painel da Supabase.
2. Abrir o app e pedir um link para um endereço seu.
3. Confirmar que o e-mail chega **na caixa de entrada**, não em spam nem em
   promoções.
4. Testar em Gmail e em Outlook: os dois filtram de formas diferentes.
5. Abrir o link e confirmar que ele devolve para o app já conectado.
6. Conferir que o endereço do app está na lista de Redirect URLs da Supabase —
   sem isso o link abre e volta para a tela de entrada.
