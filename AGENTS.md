# Diretrizes do Projeto Prot+ para Agentes de IA

Este arquivo define o contexto e as regras permanentes de operação para assistentes e agentes de IA (Antigravity / Gemini) neste repositório.

---

## 👥 1. Estrutura da Equipe
Este projeto é co-desenvolvido por dois irmãos:
1. **Paulo Henrique (Paulo):** Atua principalmente em estratégia, marketing, checkout, páginas de obrigado/conversão e infraestrutura no macOS. Identificador Git: `Paulo Henrique` (`phenrimedeiros@gmail.com`).
2. **Pedro Henrique (Pedro):** Atua principalmente em produto, modelagem de receitas, aplicativo PWA, acervo visual e arquitetura da oferta no Windows. Identificador Git: `phmmedeiros` (`pedro.arqtt@gmail.com`).

> Ao interagir ou sugerir alterações, sempre leve em consideração qual dos dois está solicitando a ação ou em qual máquina o workspace está rodando.

---

## 📋 2. Regras de Ouro de Versionamento e Colaboração
Consulte sempre o arquivo [`BOAS_PRATICAS_EQUIPE.md`](./BOAS_PRATICAS_EQUIPE.md).
- **Proibição de caminhos absolutos:** Nunca gerar links ou referências absolutas como `c:/Users/...` ou `/Volumes/...`. Use sempre caminhos relativos ao projeto.
- **Rastreabilidade obrigatória:** Sempre que realizar alterações de código ou documentação, atualize ou lembre o usuário de atualizar o [`HISTORICO_ATUALIZACOES.md`](./HISTORICO_ATUALIZACOES.md) com a autoria correspondente (Paulo ou Pedro).
- **Sincronização de progresso:** Manter o [`PROGRESSO.md`](./PROGRESSO.md) sincronizado com o status real dos entregáveis.
- **Prevenção de conflitos:** Caso uma alteração envolva arquivos sensíveis (como `04-pagina/index.html` ou `03-produto/dados/receitas.json`), verifique se não há conflito de versões e alerte sobre o impacto.

---

## 🎨 3. Padrões Técnicos e de Design
- **Tecnologias:** Vanilla HTML5, CSS3 moderno e Vanilla JavaScript (sem frameworks pesados ou bibliotecas de terceiros desnecessárias).
- **Design:** Mobile-first estrito (prioridade absoluta para viewport de 390 px).
- **Offline / PWA:** Service Worker ativo para garantir acesso offline às receitas, imagens e ferramentas.
- **Validação Local:** Servidor local rodando em `node local-preview-server.mjs` (porta 4174).
