// scripts/test-grile-publice.mts
//
// Verifica grilele din Legea-cadru nr. 153/2017 asa cum ajung pe site.
//
// Cifrele asteptate sunt citite de mana din textul consolidat al legii, nu
// preluate din modul — altfel testul ar confirma doar ca modulul e de acord cu
// el insusi. Ele sunt si plasa de siguranta pentru cea mai scumpa greseala
// posibila aici: documentul contine versiunile vechi ale fiecarui tabel, iar un
// extractor care le confunda publica cifre cu doi ani in urma. Daca „medic
// primar" ajunge vreodata 12.500 in loc de 14.125, testul cade.

import assert from "node:assert/strict";

// Calea sta intr-o variabila, ca in `test-invatamant.mts`: un import literal cu
// extensie .ts pica la `tsc --noEmit`.
const modulPath = "../src/lib/grile-publice.ts";

const { grilaPublica, MESERII_CU_GRILA, SURSA_GRILE } = (await import(
  modulPath
)) as typeof import("../src/lib/grile-publice");

let treceri = 0;
const ok = (nume: string, f: () => void) => {
  f();
  treceri++;
  console.log("  ok  " + nume);
};

/** Brutul unei trepte, dupa eticheta. */
function brut(slug: string, eticheta: string): number {
  const g = grilaPublica(slug);
  assert.ok(g, `${slug} nu are grila`);
  const t = g.trepte.find((x) => x.eticheta === eticheta);
  assert.ok(t, `${slug}: treapta „${eticheta}" lipseste (are: ${g.trepte.map((x) => x.eticheta).join(", ")})`);
  return t.brut;
}

console.log("\nSursa");

ok("trimite la textul consolidat de pe legislatie.just.ro", () => {
  assert.match(SURSA_GRILE.url, /^https:\/\/legislatie\.just\.ro\//);
  assert.match(SURSA_GRILE.act, /153\/2017/);
});

console.log("\nSanatate — Anexa II, unitati clinice, coloana iunie 2024");

// Cele mai expuse cifre de pe site. Verificate rand cu rand in tabelul
// „a.1. Unitati clinice", coloana a doua (iunie 2024).
ok("medic rezident anul I = 7.125", () => assert.equal(brut("medic", "Rezident anul I"), 7125));
ok("medic specialist = 11.187", () => assert.equal(brut("medic", "Medic specialist"), 11187));
ok("medic primar = 14.125, nu 12.500 (forma din 2020)", () =>
  assert.equal(brut("medic", "Medic primar"), 14125));
ok("medic primar dentist = 14.125", () => assert.equal(brut("stomatolog", "Medic primar dentist"), 14125));
ok("farmacist primar = 8.569", () => assert.equal(brut("farmacist", "Farmacist primar"), 8569));
ok("asistent medical postliceal, debutant = 5.250", () =>
  assert.equal(brut("asistent-medical", "Debutant (postliceal)"), 5250));
ok("asistent medical postliceal, principal = 5.474", () =>
  assert.equal(brut("asistent-medical", "Principal (postliceal)"), 5474));
ok("fiziokinetoterapeut principal = 7.470", () => assert.equal(brut("fizioterapeut", "Principal"), 7470));
ok("psiholog principal = 7.603", () => assert.equal(brut("psiholog", "Principal"), 7603));
ok("asistent social principal = 5.473", () => assert.equal(brut("asistent-social", "Principal"), 5473));

console.log("\nSanatate — personal auxiliar");

// Prima varianta a testului astepta 3.550 aici, cifra anului 2022, pentru ca
// asa aratau primele grile intalnite in document. Era gresit: personalul
// auxiliar a fost majorat in 2024 odata cu cel medico-sanitar. Exact tipul de
// eroare pentru care exista testul — doar ca de data asta o avea asteptarea
// scrisa de mana, nu codul.
ok("infirmiera = 4.615 (iunie 2024), nu 3.550 (2022)", () =>
  assert.equal(brut("infirmier", "Infirmier / infirmieră"), 4615));
ok("infirmiera debutanta = 4.485", () => assert.equal(brut("infirmier", "Debutant"), 4485));
ok("grila medicala isi declara coloana iunie 2024", () => {
  const g = grilaPublica("medic");
  assert.ok(g);
  assert.equal(g.coloana, "iunie 2024");
});

console.log("\nJustitie — Anexa V");

ok("judecator stagiar = 10.400", () => assert.equal(brut("judecator", "Judecător stagiar"), 10400));
ok("judecator de judecatorie, peste 20 ani = 17.250", () =>
  assert.equal(brut("judecator", "Judecătorie, peste 20 ani"), 17250));
ok("judecator ICCJ = 26.250", () => assert.equal(brut("judecator", "Înalta Curte"), 26250));
ok("procuror PICCJ = 25.000", () => assert.equal(brut("procuror", "Parchetul de pe lângă ÎCCJ"), 25000));

console.log("\nAdministratie, cultura, culte, veterinar");

ok("consilier superior, functii publice de stat = 6.580", () =>
  assert.equal(brut("functionar-public", "Consilier superior"), 6580));
ok("consilier debutant = 3.950", () => assert.equal(brut("functionar-public", "Consilier debutant"), 3950));
ok("bibliotecar gradul I, alte biblioteci = 4.345", () => assert.equal(brut("bibliotecar", "Gradul I"), 4345));
ok("bibliotecar gradul IA = 4.647", () => assert.equal(brut("bibliotecar", "Gradul IA"), 4647));
ok("preot gradul I, studii superioare = 4.000", () => assert.equal(brut("preot", "Gradul I"), 4000));
ok("medic primar veterinar = 6.580", () => assert.equal(brut("medic-veterinar", "Primar / gradul I"), 6580));

console.log("\nPolitie si armata — suma a doua grile (Anexa VI, art. 3 alin. 2)");

// Salariul de baza nu e o singura cifra din tabel: e solda de functie plus
// salariul gradului profesional. Un site care arata doar prima cifra
// subestimeaza cu 1.600-2.800 de lei, si e greseala pe care o face toata piata.
ok("agent de politie debutant = 3.750 functie + 1.980 grad = 5.730", () =>
  assert.equal(brut("politist", "Agent de poliție debutant"), 5730));
ok("comisar-sef = 5.791 functie + 2.838 grad = 8.629", () =>
  assert.equal(brut("politist", "Comisar-șef"), 8629));
ok("soldat = 2.500 functie + 1.584 grad = 4.084", () => assert.equal(brut("militar", "Soldat"), 4084));

ok("descompunerea e aratata, nu doar totalul", () => {
  const g = grilaPublica("politist");
  assert.ok(g);
  for (const t of g.trepte) {
    assert.ok(t.componente && t.componente.length === 2, `${t.eticheta} nu are componente`);
    assert.equal(
      t.componente.reduce((s, c) => s + c.valoare, 0),
      t.brut,
      `${t.eticheta}: componentele nu dau totalul`,
    );
  }
});

ok("pompierii militari folosesc grila armatei, cu domeniul lor", () => {
  const p = grilaPublica("pompier");
  const m = grilaPublica("militar");
  assert.ok(p && m);
  assert.deepEqual(
    p.trepte.map((t) => t.brut),
    m.trepte.map((t) => t.brut),
  );
  assert.match(p.domeniu, /Situa[țt]ii de Urgen[țt]/);
});

console.log("\nInvariante pe toate grilele");

ok(`toate cele ${MESERII_CU_GRILA.length} meserii declarate chiar au grila`, () => {
  for (const slug of MESERII_CU_GRILA) {
    assert.ok(grilaPublica(slug), `${slug} e declarat dar intoarce null`);
  }
});

ok("treptele urca — o scara de cariera nu coboara", () => {
  for (const slug of MESERII_CU_GRILA) {
    const g = grilaPublica(slug)!;
    for (let i = 1; i < g.trepte.length; i++) {
      assert.ok(
        g.trepte[i].brut >= g.trepte[i - 1].brut,
        `${slug}: „${g.trepte[i].eticheta}" (${g.trepte[i].brut}) sub „${g.trepte[i - 1].eticheta}" (${g.trepte[i - 1].brut})`,
      );
    }
  }
});

ok("netul e intre 55% si 65% din brut peste tot", () => {
  for (const slug of MESERII_CU_GRILA) {
    for (const t of grilaPublica(slug)!.trepte) {
      const cota = t.net / t.brut;
      assert.ok(cota > 0.55 && cota < 0.65, `${slug} ${t.eticheta}: net/brut = ${cota.toFixed(3)}`);
    }
  }
});

ok("nicio eticheta de treapta nu e o suma sau un fragment de antet", () => {
  for (const slug of MESERII_CU_GRILA) {
    for (const t of grilaPublica(slug)!.trepte) {
      assert.doesNotMatch(t.eticheta, /^\d|minim|maxim/i, `${slug}: „${t.eticheta}"`);
    }
  }
});

ok("meseriile din privat nu primesc grila", () => {
  for (const slug of ["programator", "barman", "sofer-tir", "avocat", "contabil"]) {
    assert.equal(grilaPublica(slug), null, `${slug} n-ar trebui sa aiba grila legala`);
  }
});

// Catalogul chiar are o meserie cu slugul „constructor". Cu o cautare prin `in`
// sau prin indexare simpla, `DEFINITII["constructor"]` intoarce constructorul
// mostenit din Object.prototype — un obiect adevarat, fara `trepte` — si build-ul
// pica pe /salarii/constructor cu „trepte is not iterable". S-a intamplat.
ok("numele mostenite din Object.prototype nu trec drept meserii bugetare", () => {
  for (const slug of ["constructor", "toString", "valueOf", "hasOwnProperty", "__proto__"]) {
    assert.equal(grilaPublica(slug), null, `„${slug}" n-ar trebui sa intoarca o grila`);
  }
});

console.log(`\n${treceri} verificari trecute.\n`);
