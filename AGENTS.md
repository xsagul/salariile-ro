# AGENTS.md — salariile.ro

**Contextul permanent al proiectului este în [`CLAUDE.md`](CLAUDE.md). Citește-l
înainte de orice altceva.** Acest fișier nu conține context propriu, deliberat.

De ce: până pe 28 august 2026 acest fișier era o copie a `CLAUDE.md`. Copia a
divergit și a rămas cu strategia veche — „monetizare prin AdSense" și „obiectiv
de tranziție profesională către front-end" — două afirmații corectate în
`CLAUDE.md` tocmai pentru că trimiseseră o sesiune întreagă pe direcția greșită.
Un fișier gol de fapte nu poate diverge.

## Unde stă fiecare fapt

| Ce cauți | Proprietar | Nu căuta în |
|---|---|---|
| Strategie, priorități, decizii luate | `CLAUDE.md` | nicăieri altundeva |
| Constante fiscale (salariu minim, cote, plafoane) | `src/lib/fiscal.ts` | proza documentelor |
| Cifre INS (câștig mediu, date pe județ/CAEN) | `src/lib/ins-date.ts` | proza documentelor |
| Identitate vizuală, voce, reguli de scriere | `BRAND.md` | — |
| Ce s-a făcut și ce a eșuat, cronologic | `PROGRES.md` (append-only) | — |
| Cercetare și audituri datate | fișierele cu dată în nume — **arhivă, nu se editează** | — |

Regula: **un fapt viu are exact un proprietar.** Dacă scrii o valoare fiscală
sau o cifră INS în proză, undeva, ai creat o a doua sursă care va rămâne în urmă.
`npm run test` rulează `scripts/test-context-drift.mts`, care pică exact pe asta.
