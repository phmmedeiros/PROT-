#!/usr/bin/env python3
"""Gera `03-produto/dados/dicas-chef.json`, a Dica de Ouro do Chef de cada receita.

O blueprint pede uma caixa de dica na tela de detalhes. A dica e montada a partir
de duas leituras da propria receita: o ingrediente que manda no resultado e a
tecnica usada no modo de preparo. Nada aqui inventa numero nutricional ou promessa
de saude -- sao apenas orientacoes de execucao na cozinha.

O arquivo gerado pode ser editado a mao depois; rodar o script de novo sobrescreve.

Uso (a partir de 03-produto/app/): python3 tools/gerar-dicas.py
"""

import json
from pathlib import Path

APP = Path(__file__).resolve().parent.parent
DADOS = APP.parent / "dados"

# Ingrediente que define o resultado -> o que fazer com ele.
# A ordem importa: o primeiro item encontrado na receita e o que manda.
POR_INGREDIENTE = [
    ("filé de tilápia grelhado", "Seque a tilápia com papel-toalha antes de levar ao fogo: peixe úmido cozinha no próprio vapor e desmancha em vez de dourar."),
    ("lombo suíno assado", "Deixe o lombo descansar 5 minutos antes de fatiar — cortado quente demais, todo o suco escorre para a tábua."),
    ("carne bovina moída magra cozida", "Espalhe a carne moída na panela e só mexa depois que o fundo dourar: aquele fundinho escuro é o sabor da receita."),
    ("peito de frango cozido e desfiado", "Desfie o frango ainda morno e com dois garfos; frio, ele quebra em pedaços duros em vez de soltar em fios."),
    ("atum em água drenado", "Aperte o atum contra a tampa da lata para tirar toda a água: cada grama a menos de líquido é um ponto a mais de sabor."),
    ("sardinha em conserva drenada", "Amasse a sardinha junto com algumas gotas de limão — a acidez corta o gosto forte da conserva."),
    ("ovo", "Use os ovos em temperatura ambiente: eles incorporam mais ar e a massa fica leve em vez de borrachuda."),
    ("queijo cottage", "Escorra o soro do cottage antes de misturar; sem o excesso de líquido a textura fica cremosa, não aguada."),
    ("ricota", "Passe a ricota por uma peneira antes de usar: ela perde os grumos e vira um creme liso na hora."),
    ("queijo muçarela", "Rale a muçarela em vez de fatiar — ralada ela derrete por igual e cobre o prato inteiro."),
    ("goma de tapioca", "Peneire a goma antes de levar à frigideira: é a peneira que faz a tapioca ficar lisa e não esfarelar."),
    ("milho para cuscuz cozido", "Hidrate o cuscuz esfregando os grãos com a ponta dos dedos — assim ele cresce soltinho em vez de compactar."),
    ("aveia em flocos", "Deixe a aveia hidratar 3 minutos na mistura antes de ir ao fogo: ela absorve o líquido e perde a textura arenosa."),
    ("leite em pó desnatado", "Dissolva o leite em pó em um pouco de líquido primeiro; jogado direto na mistura seca, ele empelota."),
    ("cacau em pó", "Peneire o cacau antes de misturar — ele empelota com facilidade e cada grumo vira um ponto amargo na boca."),
    ("chia", "Dê 5 minutos para a chia no líquido antes de servir: ela engrossa sozinha e dispensa qualquer espessante."),
    ("amendoim torrado sem sal", "Pique metade do amendoim e deixe a outra metade inteira: você ganha crocância em dois tamanhos na mesma colherada."),
    ("banana-prata", "Escolha a banana bem madura, com a casca já pintada — é ela que adoça a receita e dispensa açúcar."),
    ("morango", "Corte os morangos só na hora de montar; cortados antes, soltam água e encharcam a receita."),
    ("maçã com casca", "Mantenha a casca da maçã: além da fibra, é ela que segura a mordida e evita que a fruta vire purê."),
    ("abóbora cabotiá cozida", "Amasse a cabotiá ainda quente — fria, ela fica fibrosa e não chega a virar um purê liso."),
    ("batata-doce cozida", "Amasse a batata-doce quente e sem acrescentar água: ela já tem umidade suficiente para ficar cremosa."),
    ("grão-de-bico cozido", "Escorra e enxágue o grão-de-bico antes de usar: a água de cozimento deixa gosto de conserva no prato."),
    ("feijão carioca cozido", "Escorra bem o feijão antes de juntar — o caldo extra dilui o tempero de tudo o mais."),
    ("arroz integral cozido", "Solte os grãos de arroz integral com um garfo antes de misturar; integral empapado não volta atrás."),
    ("macarrão integral cozido", "Escorra o macarrão integral um minuto antes do ponto: ele continua cozinhando dentro do prato quente."),
    ("pão integral", "Toste o pão antes de rechear — a crosta seca segura o recheio sem deixar a fatia murchar."),
    ("brócolis cozido", "Tire o brócolis do fogo enquanto ainda está verde-vivo e firme; passando desse ponto ele amarela e perde o sabor."),
    ("espinafre cru", "Junte o espinafre só no fim: o calor que já está no prato murcha as folhas e preserva a cor."),
    ("tomate", "Salgue o tomate apenas na hora de servir — o sal puxa a água dele e encharca o prato."),
    ("cenoura crua ralada", "Rale a cenoura no lado grosso do ralador: ralada fina demais, ela simplesmente some no prato."),
    ("leite desnatado", "Aqueça o leite sem deixar ferver; fervido, ele forma película e muda a textura da mistura."),
    ("alface", "Monte a alface por último e bem seca — folha molhada não segura tempero nenhum."),
]

# Tecnica encontrada no modo de preparo -> como executar bem.
POR_TECNICA = [
    ("liquidificador", "Bata só até ficar homogêneo: batido além disso, o creme esquenta e perde a firmeza."),
    ("micro-ondas", "No micro-ondas, vá de 30 em 30 segundos — o ponto passa em segundos e resseca sem aviso."),
    ("geladeira", "Cumpra o tempo de geladeira inteiro: é o frio que firma a textura, nenhum ingrediente faz isso sozinho."),
    ("congel", "Mexa uma vez no meio do congelamento para quebrar os cristais de gelo e manter a textura cremosa."),
    ("frigideira", "Aqueça a frigideira antes de despejar a massa e mantenha fogo médio-baixo: é assim que sai casquinha dourada sem grudar."),
    ("grelh", "Não mexa na proteína enquanto grelha — ela solta sozinha da frigideira quando a crosta está pronta."),
    ("refogu", "Refogue em fogo alto e com a panela pouco cheia: amontoado, o ingrediente cozinha no vapor em vez de dourar."),
    ("panela", "Cozinhe em fogo baixo e com a panela semitampada para o vapor preso cozinhar tudo por igual."),
    ("unte", "Unte com uma camada bem fina, espalhada com papel-toalha: excesso de gordura frita em vez de dourar."),
    ("gele", "Sirva bem gelado — a temperatura baixa é o que realça o doce e fecha a textura."),
    ("amasse", "Amasse com garfo e não no processador: um pouco de pedaço inteiro dá mordida ao prato."),
    ("cozinh", "Cozinhe só até o ponto indicado; tempo extra tira textura e não acrescenta nada ao sabor."),
]

PADRAO = "Separe e meça todos os ingredientes antes de acender o fogo: receita rápida não perdoa parada no meio do preparo."
AJUSTE_SAL = "Acerte o sal apenas no final, com o prato já pronto na colher."


def dica_para(receita: dict) -> str:
    itens = {i["item"] for i in receita["ingredientes"]}
    preparo = " ".join(receita["modo_preparo"]).lower()

    principal = next((texto for item, texto in POR_INGREDIENTE if item in itens), PADRAO)
    tecnica = next((texto for chave, texto in POR_TECNICA if chave in preparo), "")

    partes = [principal]
    if tecnica:
        partes.append(tecnica)
    elif receita["categoria"] == "almoco-jantar":
        partes.append(AJUSTE_SAL)
    return " ".join(partes)


def main() -> None:
    receitas = json.loads((DADOS / "receitas.json").read_text(encoding="utf-8"))
    dicas = {r["id"]: dica_para(r) for r in receitas}

    destino = DADOS / "dicas-chef.json"
    destino.write_text(
        json.dumps(dicas, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    distintas = len(set(dicas.values()))
    print(f"dicas geradas: {len(dicas)} | textos distintos: {distintas}")
    generica = sum(1 for texto in dicas.values() if texto.startswith(PADRAO))
    print(f"receitas sem ingrediente mapeado (dica genérica): {generica}")


if __name__ == "__main__":
    main()
