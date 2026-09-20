#!/usr/bin/env python3
"""Gera as versoes leves das fotos do Prot+ usadas pelo app.

As fotos originais ficam em `images/{ID}.png` (1254x1254, ~2,5 MB cada) e sao a
fonte de verdade tambem dos PDFs e da pagina de vendas. O app nunca carrega o
PNG: ele usa as derivadas WebP geradas aqui.

    images/w400/{ID}.webp   cards do catalogo e listas das ferramentas
    images/w900/{ID}.webp   capa da tela de detalhes da receita

Uso (a partir de 03-produto/app/):

    python3 tools/otimizar-imagens.py            # gera o que falta
    python3 tools/otimizar-imagens.py --forcar   # regera tudo
"""

import json
import sys
from pathlib import Path

from PIL import Image

APP = Path(__file__).resolve().parent.parent
ORIGINAIS = APP / "images"
RECEITAS = APP.parent / "dados" / "receitas.json"

# (subpasta, largura em px, qualidade WebP)
VARIANTES = (("w400", 400, 72), ("w900", 900, 78))


def main() -> int:
    forcar = "--forcar" in sys.argv
    ids = [r["id"] for r in json.loads(RECEITAS.read_text(encoding="utf-8"))]

    for pasta, _, _ in VARIANTES:
        (ORIGINAIS / pasta).mkdir(parents=True, exist_ok=True)

    gerados = pulados = 0
    faltando = []

    for recipe_id in ids:
        origem = ORIGINAIS / f"{recipe_id}.png"
        if not origem.exists():
            faltando.append(recipe_id)
            continue

        pendentes = [
            (ORIGINAIS / pasta / f"{recipe_id}.webp", largura, qualidade)
            for pasta, largura, qualidade in VARIANTES
            if forcar or not (ORIGINAIS / pasta / f"{recipe_id}.webp").exists()
        ]
        if not pendentes:
            pulados += 1
            continue

        with Image.open(origem) as imagem:
            imagem = imagem.convert("RGB")
            for destino, largura, qualidade in pendentes:
                altura = round(imagem.height * largura / imagem.width)
                copia = imagem.resize((largura, altura), Image.LANCZOS)
                copia.save(destino, "WEBP", quality=qualidade, method=6)
                gerados += 1

    def peso(padrao: str) -> str:
        total = sum(f.stat().st_size for f in ORIGINAIS.glob(padrao))
        return f"{total / 1024 / 1024:.1f} MB"

    print(f"receitas no banco: {len(ids)}")
    print(f"arquivos gerados: {gerados} | receitas ja prontas: {pulados}")
    print(f"peso PNG original: {peso('*.png')}")
    for pasta, largura, _ in VARIANTES:
        print(f"peso {pasta} ({largura}px): {peso(pasta + '/*.webp')}")
    if faltando:
        print(f"SEM FOTO ORIGINAL ({len(faltando)}): {', '.join(faltando)}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
