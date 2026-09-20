/* Prot+ — conta, acesso e sincronização.
 *
 * Três responsabilidades, nesta ordem:
 *
 *   1. SESSÃO   entrar por link mágico, manter e encerrar a sessão
 *   2. PORTARIA confirmar que o e-mail tem compra ativa antes de abrir o app
 *   3. SINCRONIA carregar e salvar os dados da pessoa no banco
 *
 * O app consome tudo por `window.ProtConta`. Carrega depois de `vendor/supabase.js`
 * e `config.js`, e antes de `app.js`.
 */

'use strict';

window.ProtConta = (() => {
  const config = window.PROT_CONFIG;

  const cliente = window.supabase.createClient(config.supabaseUrl, config.supabaseKey, {
    auth: {
      flowType: 'pkce', // devolve `?code=` na query, sem colidir com nosso roteador de hash
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'prot-plus-sessao',
    },
  });

  const esc = (valor) =>
    String(valor).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );

  /* --------------------------------------------------------------- *
   * 1. Sessão
   * --------------------------------------------------------------- */

  async function sessaoAtual() {
    const { data } = await cliente.auth.getSession();
    return data.session || null;
  }

  async function enviarLink(email) {
    return cliente.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: config.enderecoDeRetorno,
        // Cadastro público está desligado no painel; isto reforça no cliente
        // que ninguém cria conta sem ter comprado.
        shouldCreateUser: false,
      },
    });
  }

  async function sair() {
    limparCache();
    // A assinatura push é do navegador, não da conta: se outra pessoa entrar
    // neste aparelho, o lembrete não pode chegar em nome da anterior.
    await cancelarPushNesteAparelho().catch(() => {});
    await cliente.auth.signOut();
    location.href = config.enderecoDeRetorno;
  }

  /** Tira o `?code=` da barra de endereço depois da troca pela sessão. */
  function limparEnderecoDeRetorno() {
    if (!location.search) return;
    const limpa = location.pathname + location.hash;
    history.replaceState(null, '', limpa);
  }

  /* --------------------------------------------------------------- *
   * 2. Portaria
   * --------------------------------------------------------------- */

  async function temAcesso() {
    const { data, error } = await cliente.rpc('tenho_acesso');
    if (error) throw error;
    return data === true;
  }

  /* Sessão administrativa (Paulo ou Pedro) entra sem compra. O app avisa na
     tela para não confundirem o que eles veem com o que a cliente vê. */
  async function souAdmin() {
    const { data, error } = await cliente.rpc('sou_admin');
    if (error) return false;
    return data === true;
  }

  /* --------------------------------------------------------------- *
   * 3. Sincronização
   * --------------------------------------------------------------- */

  /* O cache local é separado por usuário: dois e-mails no mesmo celular não
     podem enxergar os dados um do outro nem por um instante. */
  let chaveCache = null;
  const definirCache = (usuarioId) => (chaveCache = `prot-plus-cache:${usuarioId}`);

  function lerCache() {
    if (!chaveCache) return null;
    try {
      return JSON.parse(localStorage.getItem(chaveCache) || 'null');
    } catch {
      return null;
    }
  }

  function gravarCache(estado) {
    if (!chaveCache) return;
    try {
      localStorage.setItem(chaveCache, JSON.stringify(estado));
    } catch {
      /* navegação privada pode bloquear; o app segue funcionando */
    }
  }

  function limparCache() {
    try {
      if (chaveCache) localStorage.removeItem(chaveCache);
      // Resquício da versão anterior, quando tudo vivia só no aparelho.
      localStorage.removeItem('prot-plus-v3');
    } catch {
      /* idem */
    }
  }

  /** Última fotografia do que o servidor tem, para enviar só o que mudou. */
  let enviado = { favoritos: [], despensa: [], consumo: [] };
  let usuarioId = null;

  async function carregarEstado(estado, dia) {
    const { data: sessao } = await cliente.auth.getUser();
    usuarioId = sessao.user.id;
    definirCache(usuarioId);

    const [perfil, favoritos, despensa, consumo, semana] = await Promise.all([
      cliente.from('perfis').select('nome, meta_proteina, objetivo, faixa, peso_kg, boas_vindas_em, lembrete_hora').eq('id', usuarioId).maybeSingle(),
      cliente.from('favoritos').select('receita_id'),
      cliente.from('despensa').select('ingrediente'),
      cliente.from('consumo').select('receita_id').eq('dia', dia),
      cliente.from('semanas').select('objetivo, dias, aberto').eq('usuario_id', usuarioId).maybeSingle(),
    ]);

    const erro = [perfil, favoritos, despensa, consumo, semana].find((r) => r.error);
    if (erro) throw erro.error;

    if (perfil.data) {
      estado.nome = perfil.data.nome || '';
      estado.meta = perfil.data.meta_proteina;
      estado.objetivo = perfil.data.objetivo;
      estado.faixa = perfil.data.faixa;
      estado.peso = perfil.data.peso_kg;
      // Nulo = primeiro acesso: o app mostra as boas-vindas antes de tudo.
      estado.boasVindas = perfil.data.boas_vindas_em;
      estado.lembrete = perfil.data.lembrete_hora; // 0 é meia-noite, válido
    }

    estado.favoritos = favoritos.data.map((linha) => linha.receita_id);
    estado.despensa = despensa.data.map((linha) => linha.ingrediente);
    estado.consumo = { data: dia, itens: consumo.data.map((linha) => linha.receita_id) };
    estado.semana = semana.data
      ? { objetivo: semana.data.objetivo, dias: semana.data.dias, aberto: semana.data.aberto }
      : null;

    enviado = {
      favoritos: [...estado.favoritos],
      despensa: [...estado.despensa],
      consumo: [...estado.consumo.itens],
    };

    estado.email = sessao.user.email;
    gravarCache(estado);
  }

  /* Cada toque na tela não pode virar uma ida ao servidor: agrupamos as
     mudanças e enviamos uma vez só, pouco depois da última alteração. */
  let temporizador = null;
  let pendente = false;

  function agendarSalvamento(estado, dia) {
    gravarCache(estado);
    pendente = true;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => enviarAgora(estado, dia), 700);
  }

  /** Diferença entre duas listas: o que entrou e o que saiu. */
  function diferenca(antes, agora) {
    return {
      entraram: agora.filter((item) => !antes.includes(item)),
      sairam: antes.filter((item) => !agora.includes(item)),
    };
  }

  async function enviarAgora(estado, dia) {
    if (!usuarioId) return;
    const tarefas = [];

    tarefas.push(
      cliente.from('perfis').update({
        nome: estado.nome || null,
        meta_proteina: estado.meta,
        objetivo: estado.objetivo,
        faixa: estado.faixa,
        peso_kg: estado.peso || null,
        boas_vindas_em: estado.boasVindas || null,
        lembrete_hora: estado.lembrete ?? null,
      }).eq('id', usuarioId)
    );

    const fav = diferenca(enviado.favoritos, estado.favoritos);
    if (fav.entraram.length) {
      tarefas.push(
        cliente.from('favoritos').upsert(
          fav.entraram.map((receita_id) => ({ usuario_id: usuarioId, receita_id })),
          { onConflict: 'usuario_id,receita_id' }
        )
      );
    }
    if (fav.sairam.length) {
      tarefas.push(cliente.from('favoritos').delete().in('receita_id', fav.sairam));
    }

    const desp = diferenca(enviado.despensa, estado.despensa);
    if (desp.entraram.length) {
      tarefas.push(
        cliente.from('despensa').upsert(
          desp.entraram.map((ingrediente) => ({ usuario_id: usuarioId, ingrediente })),
          { onConflict: 'usuario_id,ingrediente' }
        )
      );
    }
    if (desp.sairam.length) {
      tarefas.push(cliente.from('despensa').delete().in('ingrediente', desp.sairam));
    }

    // O consumo do dia é uma lista pequena que aceita repetição (a pessoa pode
    // comer a mesma receita duas vezes), então regravamos o dia inteiro.
    const mudouConsumo =
      enviado.consumo.length !== estado.consumo.itens.length ||
      enviado.consumo.some((id, i) => id !== estado.consumo.itens[i]);

    if (mudouConsumo) {
      await cliente.from('consumo').delete().eq('dia', dia);
      if (estado.consumo.itens.length) {
        tarefas.push(
          cliente.from('consumo').insert(
            estado.consumo.itens.map((receita_id) => ({ usuario_id: usuarioId, receita_id, dia }))
          )
        );
      }
    }

    if (estado.semana) {
      tarefas.push(
        cliente.from('semanas').upsert({
          usuario_id: usuarioId,
          objetivo: estado.semana.objetivo,
          dias: estado.semana.dias,
          aberto: estado.semana.aberto ?? 0,
        })
      );
    }

    const respostas = await Promise.all(tarefas);
    const falha = respostas.find((r) => r && r.error);
    if (falha) {
      console.error('Falha ao sincronizar:', falha.error.message);
      return; // `pendente` segue verdadeiro e a próxima alteração tenta de novo
    }

    enviado = {
      favoritos: [...estado.favoritos],
      despensa: [...estado.despensa],
      consumo: [...estado.consumo.itens],
    };
    pendente = false;
  }

  /** Fechar o app com algo pendente não pode perder o que a pessoa acabou de fazer. */
  function salvarAoSair(estado, dia) {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && pendente) {
        clearTimeout(temporizador);
        enviarAgora(estado, dia);
      }
    });
  }

  /* --------------------------------------------------------------- *
   * 4. Lembrete diário (Web Push)
   * --------------------------------------------------------------- */

  function base64urlParaBytes(texto) {
    const base64 = texto.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(texto.length / 4) * 4, '=');
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  }

  const suportaPush = () =>
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  /** Pede permissão, assina neste aparelho e guarda a assinatura na conta. */
  async function assinarPush() {
    if (!suportaPush()) throw new Error('sem-suporte');
    const permissao = await Notification.requestPermission();
    if (permissao !== 'granted') throw new Error('sem-permissao');

    const registro = await navigator.serviceWorker.ready;
    const assinatura =
      (await registro.pushManager.getSubscription()) ||
      (await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64urlParaBytes(config.vapidPublicKey),
      }));

    const { endpoint, keys } = assinatura.toJSON();
    const { error } = await cliente
      .from('push_assinaturas')
      .upsert({ usuario_id: usuarioId, endpoint, chaves: keys }, { onConflict: 'endpoint' });
    if (error) throw error;
  }

  async function cancelarPushNesteAparelho() {
    if (!suportaPush()) return;
    const registro = await navigator.serviceWorker.ready;
    const assinatura = await registro.pushManager.getSubscription();
    if (!assinatura) return;
    await cliente.from('push_assinaturas').delete().eq('endpoint', assinatura.endpoint);
    await assinatura.unsubscribe();
  }

  /* --------------------------------------------------------------- *
   * Telas de entrada
   * --------------------------------------------------------------- */

  function moldura(conteudo) {
    document.body.classList.add('sem-sessao');
    document.querySelector('#view').innerHTML = `<div class="portao">${conteudo}</div>`;
  }

  function telaLogin(mensagem = '') {
    moldura(`
      <div class="portao-marca"><span>Prot</span><b>+</b></div>
      <h2>Entre com o seu e-mail</h2>
      <p class="apagado">
        Use o mesmo e-mail da sua compra. Enviamos um link de acesso — não existe senha
        para decorar.
      </p>
      <form id="form-entrar" novalidate>
        <input class="campo" id="email-entrar" type="email" inputmode="email"
               autocomplete="email" placeholder="seu@email.com" required>
        <button type="submit" class="acao" id="botao-entrar">Receber meu link de acesso</button>
      </form>
      ${mensagem ? `<p class="portao-recado">${mensagem}</p>` : ''}
      <p class="apagado pequeno portao-rodape">
        Comprou e não consegue entrar? Fale com ${esc(config.emailSuporte)}.
      </p>`);
  }

  function telaLinkEnviado(email) {
    moldura(`
      <div class="portao-marca"><span>Prot</span><b>+</b></div>
      <h2>Link enviado</h2>
      <p class="apagado">
        Se <strong>${esc(email)}</strong> tiver uma compra do Prot+, o link de acesso
        chega em instantes. Ele vale por 1 hora e só funciona uma vez.
      </p>
      <p class="apagado pequeno">
        Não chegou em alguns minutos? Confira a caixa de spam ou promoções.
      </p>
      <button type="button" class="acao discreta" data-acao="voltar-login">
        Tentar com outro e-mail
      </button>`);
  }

  function telaSemAcesso(email) {
    moldura(`
      <div class="portao-marca"><span>Prot</span><b>+</b></div>
      <h2>Não encontramos uma compra ativa</h2>
      <p class="apagado">
        A conta <strong>${esc(email)}</strong> está conectada, mas não tem uma compra
        ativa do Prot+ no momento.
      </p>
      <p class="apagado pequeno">
        Se você comprou agora, aguarde alguns minutos e recarregue: a liberação é
        automática assim que o pagamento é confirmado.
      </p>
      <button type="button" class="acao" onclick="location.reload()">Verificar de novo</button>
      <button type="button" class="acao discreta" data-acao="sair">Entrar com outro e-mail</button>
      <p class="apagado pequeno portao-rodape">Suporte: ${esc(config.emailSuporte)}</p>`);
  }

  /* Sem rede, uma chamada ao servidor pode simplesmente nunca responder — e a
     pessoa fica olhando uma tela vazia sem entender o que houve. Todo passo de
     abertura que depende da internet passa por aqui. */
  function comLimite(promessa, ms = 12000) {
    return Promise.race([
      promessa,
      new Promise((_, rejeitar) =>
        setTimeout(() => rejeitar(new Error('tempo esgotado')), ms)
      ),
    ]);
  }

  function telaSemInternet() {
    moldura(`
      <div class="portao-marca"><span>Prot</span><b>+</b></div>
      <h2>Sem conexão</h2>
      <p class="apagado">
        O Prot+ precisa de internet para confirmar o seu acesso. Assim que a conexão
        voltar, o app abre sozinho.
      </p>
      <button type="button" class="acao" onclick="location.reload()">Tentar agora</button>`);

    // Reabre sozinho quando a conexão voltar, sem a pessoa precisar fazer nada.
    window.addEventListener('online', () => location.reload(), { once: true });
  }

  function telaErro(texto) {
    moldura(`
      <div class="portao-marca"><span>Prot</span><b>+</b></div>
      <h2>Não foi possível abrir o Prot+</h2>
      <p class="apagado">${esc(texto)}</p>
      <button type="button" class="acao" onclick="location.reload()">Tentar de novo</button>`);
  }

  /** Liga o formulário de login. Fica aqui porque só existe nestas telas. */
  function ligarPortao() {
    document.addEventListener('submit', async (evento) => {
      if (evento.target.id !== 'form-entrar') return;
      evento.preventDefault();

      const campo = document.querySelector('#email-entrar');
      const botao = document.querySelector('#botao-entrar');
      const email = campo.value.trim();

      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return telaLogin('Confira o e-mail digitado.');
      }

      botao.disabled = true;
      botao.textContent = 'Enviando...';

      const { error } = await enviarLink(email);

      if (error) {
        // Mensagem genérica de propósito: dizer "este e-mail não comprou"
        // permitiria descobrir quem é cliente testando endereços.
        const limite = /rate|limit|seconds/i.test(error.message);
        telaLogin(
          limite
            ? 'Muitas tentativas seguidas. Espere um minuto e tente de novo.'
            : 'Não conseguimos enviar agora. Tente novamente em instantes.'
        );
        return;
      }

      telaLinkEnviado(email);
    });

    document.addEventListener('click', (evento) => {
      const alvo = evento.target.closest('[data-acao]');
      if (!alvo) return;
      if (alvo.dataset.acao === 'voltar-login') telaLogin();
      if (alvo.dataset.acao === 'sair') sair();
    });
  }

  return {
    cliente,
    sessaoAtual,
    temAcesso,
    souAdmin,
    sair,
    limparEnderecoDeRetorno,
    carregarEstado,
    agendarSalvamento,
    salvarAoSair,
    suportaPush,
    assinarPush,
    cancelarPushNesteAparelho,
    lerCache,
    limparCache,
    telaLogin,
    telaSemAcesso,
    telaSemInternet,
    telaErro,
    comLimite,
    ligarPortao,
  };
})();
