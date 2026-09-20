#!/usr/bin/env python3
"""Gera os icones do PWA Prot+ em `images/icons/`.

Sem icones no manifest.json o navegador nao oferece "adicionar a tela inicial",
que e a promessa central da oferta. Os arquivos gerados:

    icon-192.png          icone padrao (Android / aba)
    icon-512.png          icone padrao grande
    icon-maskable-512.png  area segura interna para Android adaptativo
    apple-touch-icon.png  iPhone e iPad (180px, sem transparencia)
    favicon.png           32px

Uso (a partir de 03-produto/app/): python3 tools/gerar-icones.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

DESTINO = Path(__file__).resolve().parent.parent / "images" / "icons"

VERDE = (21, 59, 46)
VERDE_CLARO = (39, 99, 75)
CREME = (255, 250, 242)
LARANJA = (232, 131, 66)

FONTES = (
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial Bold.ttf",
)


def fonte(tamanho: int) -> ImageFont.FreeTypeFont:
    for caminho in FONTES:
        if Path(caminho).exists():
            return ImageFont.truetype(caminho, tamanho)
    return ImageFont.load_default(tamanho)


def centralizar(draw, texto, font, centro):
    esquerda, topo, direita, base = draw.textbbox((0, 0), texto, font=font)
    return (centro[0] - (direita + esquerda) / 2, centro[1] - (base + topo) / 2)


def fundo(tela: int) -> Image.Image:
    """Gradiente vertical suave do verde escuro da marca para o verde claro."""
    faixa = Image.new("RGB", (1, tela))
    pixels = faixa.load()
    for y in range(tela):
        t = y / max(1, tela - 1)
        pixels[0, y] = tuple(
            round(claro + (escuro - claro) * t) for claro, escuro in zip(VERDE_CLARO, VERDE)
        )
    return faixa.resize((tela, tela), Image.BICUBIC)


def desenhar(lado: int, margem_segura: float = 0.0, arredondado: bool = True) -> Image.Image:
    """Desenha o icone. `margem_segura` encolhe a marca para o formato maskable."""
    escala = 4
    tela = lado * escala
    raio = int(tela * 0.22) if arredondado else 0

    mascara = Image.new("L", (tela, tela), 0)
    ImageDraw.Draw(mascara).rounded_rectangle((0, 0, tela - 1, tela - 1), radius=raio, fill=255)

    imagem = Image.new("RGBA", (tela, tela), (0, 0, 0, 0))
    imagem.paste(fundo(tela), (0, 0), mascara)
    draw = ImageDraw.Draw(imagem)

    fator = 1 - margem_segura
    centro_x = tela / 2
    # a marca (P+ e barra) e centrada como um bloco unico
    centro_y = tela / 2 - tela * 0.045 * fator

    p_font = fonte(int(tela * 0.50 * fator))
    mais_font = fonte(int(tela * 0.26 * fator))

    largura_p = draw.textlength("P", font=p_font)
    largura_mais = draw.textlength("+", font=mais_font)
    vao = tela * 0.02 * fator
    inicio = centro_x - (largura_p + vao + largura_mais) / 2

    draw.text(
        centralizar(draw, "P", p_font, (inicio + largura_p / 2, centro_y)),
        "P",
        font=p_font,
        fill=CREME,
    )
    draw.text(
        centralizar(
            draw,
            "+",
            mais_font,
            (inicio + largura_p + vao + largura_mais / 2, centro_y - tela * 0.09 * fator),
        ),
        "+",
        font=mais_font,
        fill=LARANJA,
    )

    # barra do Monitor Diario: trilho claro com progresso laranja
    largura = tela * 0.44 * fator
    altura = max(2, tela * 0.055 * fator)
    y = centro_y + tela * 0.30 * fator
    esquerda = centro_x - largura / 2
    draw.rounded_rectangle(
        (esquerda, y, esquerda + largura, y + altura), radius=altura / 2, fill=CREME + (70,)
    )
    draw.rounded_rectangle(
        (esquerda, y, esquerda + largura * 0.68, y + altura), radius=altura / 2, fill=LARANJA
    )

    return imagem.resize((lado, lado), Image.LANCZOS)


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)

    arquivos = {
        "icon-192.png": desenhar(192),
        "icon-512.png": desenhar(512),
        "icon-maskable-512.png": desenhar(512, margem_segura=0.22, arredondado=False),
        "favicon.png": desenhar(32),
    }
    # iOS ignora transparencia e canto arredondado: fundo cheio e quadrado.
    apple = Image.new("RGB", (180, 180), VERDE)
    apple.paste(desenhar(180, arredondado=False), (0, 0), desenhar(180, arredondado=False))
    arquivos["apple-touch-icon.png"] = apple

    for nome, imagem in arquivos.items():
        imagem.save(DESTINO / nome, "PNG", optimize=True)
        print(f"{nome}: {(DESTINO / nome).stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
