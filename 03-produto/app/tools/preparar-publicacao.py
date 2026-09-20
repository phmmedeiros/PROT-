#!/usr/bin/env python3
"""Monta o pacote do Prot+ para publicar em https://app.comersemprebem.site

O app roda localmente em `/app/` e carrega os dados por `../dados/`. No servidor
ele fica na RAIZ do subdominio, e `../dados/` continua funcionando porque o
navegador nao deixa `..` subir acima da raiz: de `https://app.../` o caminho
`../dados/receitas.json` resolve para `https://app.../dados/receitas.json`.

Por isso o pacote coloca os JSON numa pasta `dados/` ao lado do index.html, e
nenhum caminho do codigo precisa mudar entre o ambiente local e o publicado.

O que NAO vai junto:
  - `images/*.png`  os originais somam 280 MB; o app so usa as versoes WebP.
                    (Eles continuam no repositorio, alimentando PDFs e a pagina.)
  - `qa/`           prints de teste
  - `tools/`        scripts de manutencao

Uso (a partir de 03-produto/app/):

    python3 tools/preparar-publicacao.py

Gera `dist/prot-plus-AAAAMMDD_HHMMSS.zip`, pronto para subir.
"""

import shutil
import zipfile
from datetime import datetime
from pathlib import Path

APP = Path(__file__).resolve().parent.parent
DADOS = APP.parent / "dados"
DIST = APP / "dist"

ARQUIVOS_RAIZ = [
    "index.html",
    "app.js",
    "conta.js",
    "config.js",
    "style.css",
    "manifest.json",
    "service-worker.js",
]

PASTAS = [
    ("images/icons", "images/icons"),
    ("images/w400", "images/w400"),
    ("images/w900", "images/w900"),
    ("vendor", "vendor"),
]

JSONS = ["receitas.json", "dicas-chef.json", "bonus.json"]


def main() -> int:
    faltando = [nome for nome in ARQUIVOS_RAIZ if not (APP / nome).exists()]
    faltando += [f"dados/{nome}" for nome in JSONS if not (DADOS / nome).exists()]
    if faltando:
        print("Faltam arquivos obrigatorios:")
        for nome in faltando:
            print(f"  - {nome}")
        return 1

    DIST.mkdir(exist_ok=True)
    carimbo = datetime.now().strftime("%Y%m%d_%H%M%S")
    destino = DIST / f"prot-plus-{carimbo}.zip"

    total = 0
    with zipfile.ZipFile(destino, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for nome in ARQUIVOS_RAIZ:
            z.write(APP / nome, nome)
            total += 1

        for origem, dentro in PASTAS:
            pasta = APP / origem
            if not pasta.exists():
                print(f"AVISO: pasta ausente, seguindo sem ela: {origem}")
                continue
            for arquivo in sorted(pasta.iterdir()):
                if arquivo.is_file() and not arquivo.name.startswith("."):
                    z.write(arquivo, f"{dentro}/{arquivo.name}")
                    total += 1

        for nome in JSONS:
            z.write(DADOS / nome, f"dados/{nome}")
            total += 1

    tamanho = destino.stat().st_size / 1024 / 1024
    print(f"pacote: {destino.relative_to(APP)}")
    print(f"arquivos: {total} | tamanho: {tamanho:.1f} MB")

    # Conferencia rapida do que entrou, por pasta.
    with zipfile.ZipFile(destino) as z:
        nomes = z.namelist()
    for prefixo in ("images/w400/", "images/w900/", "images/icons/", "dados/", "vendor/"):
        print(f"  {prefixo:<16} {sum(1 for n in nomes if n.startswith(prefixo))} arquivos")

    # Limpa pacotes antigos, deixando os 3 mais recentes.
    antigos = sorted(DIST.glob("prot-plus-*.zip"))[:-3]
    for velho in antigos:
        velho.unlink()
    if antigos:
        print(f"removidos {len(antigos)} pacotes antigos")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
