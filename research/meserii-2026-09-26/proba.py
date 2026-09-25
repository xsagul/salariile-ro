# Proba metodei art. 33 (26 septembrie 2026): asistenții medicali din două spitale județene.
# Nu e colectorul final: fiecare model de fișier va avea descrierea lui de coloane și teste.
#
#   python proba.py <cluj.pdf> <alba.pdf>   → proba-asistent-medical.json
#
# Cere `pdftotext` (xpdf 4, modul -table păstrează rândurile tabelului întregi).
# Metrica: salariul fix = baza + sporul de condiții de muncă (sumele publicate), fără ture,
# gărzi și ore suplimentare. Netul se calculează separat, rând cu rând, cu src/lib/fiscal.ts.
import json, re, subprocess, sys

def text(pdf):
    return subprocess.run(["pdftotext", "-table", "-enc", "UTF-8", pdf, "-"],
                          capture_output=True).stdout.decode("utf-8", "replace").splitlines()

rows = []

# SCJU Cluj, martie 2026: funcție | salariu de bază | % spor condiții | valoare brută spor.
for line in text(sys.argv[1]):
    m = re.match(r"\s*(asistent medical(?: principal| debutant)?)\s{2,}(\d{3,6})(?:\s+([\d.,]+)\s*%\s+(\d+))?\s*$", line, re.I)
    if m:
        rows.append(dict(sursa="scju-cluj", judet="CJ", perioada="2026-03", functie=m.group(1).lower(),
                         baza=int(m.group(2)), sporConditii=int(m.group(4) or 0)))

# SJU Alba Iulia, luna februarie publicată la 31.03.2026: nr | secție | funcție | gradație |
# sal. bază | indemnizație titlu doctor | % spor periculoase | sumă | % spor condiții deosebite
# | sumă | … (ture, noapte, gărzi, hrană — variabile, în afara probei).
for line in text(sys.argv[2]):
    m = re.match(r"\s*\d+\s+(.+?)\s{2,}(ASISTENT MEDICAL(?: PRINCIPAL| DEBUTANT)?)\s{2,}(Gradatia \d|BAZA)\s+([\d\s]+)$", line)
    if m:
        t = [int(x) for x in m.group(4).split()]
        if len(t) < 6:
            continue
        rows.append(dict(sursa="sju-alba", judet="AB", perioada="2026-02", functie=m.group(2).lower(),
                         gradatie=m.group(3), sectie=m.group(1).strip(), baza=t[0], sporConditii=t[3] + t[5]))

json.dump(rows, open("proba-asistent-medical.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(rows), "rânduri")
