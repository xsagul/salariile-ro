import fs from 'node:fs';
const input = JSON.parse(fs.readFileSync('research/surse-salarii/ejobs-2026-tabele.json','utf8'));
// Asociere editorială explicită; fără fuzzy matching și fără salarii calibrate.
const mapping = {
 programator:'Software Developer','web-developer':'Web Developer','devops-engineer':'DevOps Engineer',
 'administrator-sistem':'Administrator IT','tester-qa':'QA testare manuală',contabil:'Contabil',avocat:'Avocat',
 auditor:'Auditor','consilier-juridic':'Consilier juridic','analist-financiar':'Analist financiar','ofiter-credite':'Ofițer credite',
 'sofer-tir':'Șofer TIR/camion','sofer-autobuz':'Șofer autobuz',taximetrist:'Șofer taxi',electrician:'Electrician',instalator:'Instalator',
 sudor:'Sudor','mecanic-auto':'Mecanic auto','operator-productie':'Operator producție','operator-cnc':'Operator CNC',
 electromecanic:'Tehnician electromecanic',croitor:'Croitor',curier:'Curier',logistician:'Logistician',
 vanzator:'Lucrător comercial',casier:'Casier',bucatar:'Bucătar',chelner:'Ospătar',barman:'Barman','agent-turism':'Agent turism',
 'agent-paza':'Agent pază și securitate','agent-curatenie':'Personal curățenie',frizer:'Frizer',cosmetician:'Cosmetician',
 'ingrijitor-batrani':'Îngrijitor persoane vârstnice','asistent-medical':'Asistent medical',farmacist:'Farmacist',
 stomatolog:'Stomatolog','medic-veterinar':'Medic veterinar','tehnician-dentar':'Tehnician dentar',kinetoterapeut:'Kinetoterapeut',
 'asistent-farmacie':'Asistent farmacist',psiholog:'Psiholog',infirmier:'Infirmier/ă',
 invatator:'Învățător',educator:'Educator','profesor-universitar':'Profesor universitar',actor:'Actor',
 arhitect:'Arhitect','agent-imobiliar':'Agent imobiliar','agent-vanzari':'Agent vânzări','designer-grafic':'Graphic Designer',
 secretar:'Secretar administrativ',editor:'Redactor','insotitor-de-bord':'Echipaj cabină',
 'inginer-auto':'Inginer automotive','inginer-telecomunicatii':'Inginer telecomunicații',
 'inginer-aeronautic':'Inginer aeronave','inginer-agronom':'Inginer agronom','inginer-energetician':'Inginer energetician',
 'specialist-marketing':'Specialist Marketing',jurnalist:'Jurnalist',traducator:'Traducător',cameraman:'Cameraman',
 'agent-asigurari':'Agent asigurări',broker:'Broker','manager-magazin':'Manager/Director magazin',
 'operator-call-center':'Specialist servicii clienți',crupier:'Crupier cazino'
};
const notes = {
 'tester-qa':'Rolul sursei este QA manual; automatizarea nu este o cohortă separată în acest reper.',
 'sofer-tir':'Sursa cumulează șoferi TIR/camion. Nu separă cursele interne de cele externe și nici diurna de salariul de bază.',
 taximetrist:'Statistica nu precizează tratamentul comisioanelor și cheltuielilor mașinii; nu o interpreta drept profit al unei activități independente.',
 'administrator-sistem':'Administrator IT este un rol apropiat; sursa nu izolează administratorii de sisteme de ceilalți administratori IT.',
 'asistent-medical':'Nu există separare public/privat, secție, ture sau sporuri în celula publicată.',
 'operator-call-center':'Specialist servicii clienți este mai larg decât operator telefonic; canalele și limbile nu sunt separate.',
 stomatolog:'Sursa nu separă contractul de muncă de colaborarea pe procent; nu reprezintă încasările unui cabinet.',
 'insotitor-de-bord':'Sursa nu publică separat baza, diurnele și plata orelor de zbor.'
};
const records = Object.entries(mapping).map(([slug,role])=>{
 const matches=input.rows.filter(r=>r[0]===role);
 const amounts=[...new Set(matches.map(r=>Number(r[1].replace(/[^0-9]/g,''))))];
 if(amounts.length!==1 || !amounts[0]) throw new Error(`Ambiguous source: ${role}`);
 return {slug,role,net:amounts[0],note:notes[slug]??'Sursa cumulează orașele și nivelurile de experiență; nu publică eșantionul acestei ocupații.'};
});
fs.writeFileSync('src/data/repere-piata-verificate.json',JSON.stringify({
 source:'eJobs, Ghidul Salarial 2026 / Salario',url:input.url,checkedAt:input.checkedAt,
 period:'31 martie 2025 – 31 martie 2026',metric:'mean',unit:'net/month/RON',
 method:'Raportări voluntare ale angajaților. Eșantionul total al ghidului nu este eșantionul fiecărei meserii.',records
},null,2)+'\n');
console.log(`${records.length} repere importate cu valoarea exactă din sursă.`);
