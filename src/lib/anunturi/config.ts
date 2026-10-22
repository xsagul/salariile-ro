// Confirmarea anunțurilor pe email (proprietar, 22 octombrie 2026, după un anunț fals de pe Reddit cu
// numărul unui necunoscut). Pornit: formularul cere emailul, anunțul se salvează „neconfirmat” și apare
// abia după ce linkul primit e deschis; din același link se gestionează. Emailurile pleacă prin Resend
// (planul gratuit, 100 pe zi), cu secretul RESEND_KEY pe Worker și domeniul verificat la Resend.
// Oprit: anunțul apare pe loc, fără email, ca din 29 septembrie 2026. Nu-l porni înainte ca
// RESEND_KEY să existe: fără el, orice postare ar primi „Nu am putut trimite emailul de confirmare”.
export const EMAIL_ACTIV = false;
