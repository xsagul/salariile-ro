// Cheia publică Cloudflare Turnstile (verificarea anti-spam din formulare). E publică prin
// definiție: stă în HTML. Cheia secretă e secretul TURNSTILE_SECRET al Worker-ului.
// Goală până la crearea widgetului în contul Cloudflare al site-ului: formularele merg fără
// verificare, iar Worker-ul o sare când nu are secretul (numai local).
export const TURNSTILE_SITEKEY = "";
