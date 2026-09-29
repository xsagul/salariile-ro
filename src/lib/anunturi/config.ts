// Cheia publică Cloudflare Turnstile (verificarea anti-spam din formulare). E publică prin
// definiție: stă în HTML. Cheia secretă e secretul TURNSTILE_SECRET al Worker-ului.
// Widgetul „salariile.ro anunturi” (Managed, hostname salariile.ro), creat pe 29 septembrie 2026.
// Worker-ul sare verificarea cât nu are secretul; cu secretul pus, un token lipsă e respins.
export const TURNSTILE_SITEKEY = "0x4AAAAAAFJPx8RlIbuSb2T_";

// Emailurile către cei care postează. Trimiterea către adrese oarecare cere Workers Paid (5 $/lună),
// pe care proprietarul nu-l plătește acum (29 septembrie 2026). Cât e `false`, formularul nu cere
// emailul (nu strângem o dată pe care n-o folosim), iar linkul de gestionare apare numai pe ecran,
// după publicare. Pornit: câmpul revine, obligatoriu, și linkul pleacă și pe email (binding-ul
// `send_email` din wrangler.jsonc trebuie adăugat odată cu el).
export const EMAIL_ACTIV = false;
