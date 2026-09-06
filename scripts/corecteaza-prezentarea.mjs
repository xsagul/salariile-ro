import fs from 'node:fs';
function edit(path, fn) {const old=fs.readFileSync(path,'utf8');const next=fn(old);if(next===old)throw new Error(`No change: ${path}`);fs.writeFileSync(path,next);}
edit('src/app/(site)/salarii/[meserie]/page.tsx',s=>s
 .replace("import ReperSalariu from", "import TransparentaSalariu from '@/app/components/TransparentaSalariu';\nimport ReperSalariu from")
 .replace('a: `Salariile.ro utilizează o metodologie exhaustivă multi-sursă: analizăm rapoartele salariale din piața privată de recrutare (eJobs Salario, Hays România), grilele oficiale din sectorul public (Legea 153/2017 cu valoarea mediană a treptelor profesionale) și intersecția statistică a seriilor INS (FOM121A × FOM106G). Fiecare sumă este granulară, reală și atribuită specific rolului.`,', 'a: descriereReper(date),')
 .replace('<ReperSalariu date={date} />','<ReperSalariu date={date} />\n          <TransparentaSalariu slug={slug} />')
 .replace('Vezi salariul net și compară meserii înrudite.','Vezi reperul salarial, sursa și limitele lui. Compară meserii înrudite.')
 .replace('analizate pe site, după venitul net de referință.','cu medii declarate în aceeași ediție Salario. Valorile egale au același loc.')
 .replaceAll('text-stone-500','text-stone-600'));
edit('src/app/(site)/salarii/page.tsx',s=>s
 .replace(/const DESCRIERE = `[^`]+`;/,'const DESCRIERE = `Repere salariale pentru ${MESERII.length} meserii în România: medii declarate, grile de bază și context INS. Surse, perioade și comparații explicate.`;')
 .replace(/a: `Salariile.ro aplică o metodologie exhaustivă[^`]+`,/,'a: `Pentru fiecare meserie indicăm tipul datelor disponibile: medie declarată de angajați în Salario, interval din grila legală sau context statistic INS. Sursele de angajator sunt prezentate separat. Nu combinăm populații și perioade diferite într-o medie națională.`,')
 .replace('Sume nete lunare obținute prin metodologie exhaustivă multi-sursă: anunțuri de angajare, grile legale, rapoarte salariale și date INS — fiecare cifră este verificată încrucișat.','Sume nete lunare cu sursa și perioada alături. Mediile declarate, intervalele din grile și estimările de grupă au semnificații diferite.')
 .replace('Fiecare sumă netă afișată pe Salariile.ro este rezultatul unui studiu multi-sursă riguros. Paginile noastre combină rapoartele salariale din piața de recrutare privată, valorile mediane ale treptelor din grilele oficiale și intersecția statistică INS. Toate cifrele sunt prezentate în bani net primiți în mână, cu indicarea transparentă a sursei și a perioadei de referință.','Sursele se verifică separat: raportările angajaților descriu un eșantion voluntar, documentele angajatorilor descriu o instituție, iar INS oferă context pe activități și grupe. Grilele indică baza legală. Nu transformăm o medie sectorială sau suma dintr-o grilă într-un salariu observat al meseriei.'));
edit('src/app/(site)/metodologie/page.tsx',s=>{
 const start=s.indexOf('            <h2 id="salarii">');
 const end=s.indexOf('        </Section>',start);
 return s.slice(0,start)+`            <h2 id="salarii">Cum verificăm salariile pe meserii</h2>
            <p>Fiecare reper din <Link href="/salarii">catalog</Link> păstrează sursa, perioada, populația și natura sumei. Sursele independente sunt prezentate alături, cu diferențele explicate. Nu calculăm o medie între un sondaj, o ofertă și o grilă.</p>
            <h3>Salarii declarate de angajați</h3>
            <p>Folosim mediile nete publicate în <a href="https://cariera.ejobs.ro/salarii-romania-ghidul-salarial-ejobs-2026/">Ghidul Salarial eJobs 2026</a>, pentru raportări între 31 martie 2025 și 31 martie 2026. Eșantionul este voluntar. Numărul total de răspunsuri din ghid nu reprezintă numărul de răspunsuri al fiecărei meserii. Păstrăm denumirea exactă a rolului sursei și semnalăm asocierile mai largi.</p>
            <h3>Raportări de angajator și grile</h3>
            <p>Documentele de transparență salarială permit separarea bazei de sporuri. Publicăm intervale ale funcțiilor din instituția citată. Conversia brut/net este standard, fără presupuneri despre deducerile persoanelor. Rândurile nu sunt tratate automat ca angajați distincți. Componentele anuale nu se adună la salariul lunar.</p>
            <p>Grilele Legii 153/2017 indică trepte ale bazei legale, nu media salariilor încasate. Afișăm intervalul treptelor disponibile. Fără ponderile angajaților pe trepte nu putem calcula o mediană a personalului.</p>
            <h3>Estimări INS și limite ocupaționale</h3>
            <p>FOM121A încrucișează activitatea economică și grupa majoră ISCO. Corelarea cu seria lunară FOM106G produce o estimare de grupă, nu salariul unui cod COR. Datele pe județe descriu activități economice, iar vârsta nu este echivalentul experienței profesionale.</p>
            <h3>Controlul surselor</h3>
            <p>Nu inventăm numere de anunțuri, percentile sau scoruri de încredere. Două meserii pot avea aceeași valoare raportată. Nu modificăm cifrele pentru a obține salarii distincte și nu eliminăm observații istorice folosind pragul legal dintr-o altă perioadă.</p>
            <h3 id="corectii">Jurnal de corecții</h3>
            <p><time dateTime="2026-09-07">7 septembrie 2026</time>: am retras afirmațiile despre eșantioane de anunțuri și scoruri de încredere fără înregistrări verificabile, am înlocuit reperele de piață cu valori atribuite punctual și am separat intervalele din grile de salariile declarate. Am adăugat raportări de angajator cu baza și componentele lunare distincte. Revizia de date și implementarea aparțin autorului site-ului; nu declarăm o revizie contabilă externă.</p>
`+s.slice(end);
});
edit('public/llms.txt',s=>s.split('\n').map(l=> l.includes('studii exhaustive') ? '- [Salarii pe meserii](https://salariile.ro/salarii): repere de piață atribuite, intervale din grile și context INS. Verificați tipul, populația și perioada fiecărei cifre.' : l.includes('metodologie exhaustivă') ? '- O medie declarată Salario, un interval al bazei legale și o estimare CAEN × ISCO nu sunt aceeași măsură. Raportările instituțiilor publice sunt locale, nu medii naționale. Nu există eșantion propriu de salarii sau anunțuri.' : l).join('\n'));
edit('src/lib/meserii.ts',s=>s.replace('scoruri.push({ slug: meserie.slug, net: ind.value ?? 0 });',"if (reper.kind === 'external-reported' && ind.value !== null) scoruri.push({ slug: meserie.slug, net: ind.value });")
 .replace('loc: i + 1,','loc: scoruri.findIndex(r => r.net === scoruri[i].net) + 1,')
 .replace('laEgalitate: 0,','laEgalitate: scoruri.filter(r => r.net === scoruri[i].net).length - 1,'));
edit('src/lib/seo.ts',s=>s.replace('MESERII_EDITORIAL_UPDATE = new Date("2026-09-06','MESERII_EDITORIAL_UPDATE = new Date("2026-09-07')
 .replace(/("\/(?:salarii|salarii\/clasament|metodologie)": new Date\(")[^"]+/g,'$12026-09-07T00:00:00.000Z'));
