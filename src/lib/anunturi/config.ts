// Emailurile către cei care postează. Trimiterea către adrese oarecare cere Workers Paid (5 $/lună),
// pe care proprietarul nu-l plătește acum (29 septembrie 2026). Cât e `false`, formularul nu cere
// emailul (nu strângem o dată pe care n-o folosim), iar linkul de gestionare apare numai pe ecran,
// după publicare. Pornit: câmpul revine, obligatoriu, și linkul pleacă și pe email (binding-ul
// `send_email` din wrangler.jsonc trebuie adăugat odată cu el).
export const EMAIL_ACTIV = false;
