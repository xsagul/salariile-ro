-- Cum îl contactează candidații pe angajator (proprietar, 22 octombrie 2026): telefon, WhatsApp
-- (pe același număr sau pe altul) și CV pe email. Emailul pentru CV-uri e doar cel confirmat la
-- publicare, coloana `email`, nu o adresă scrisă separat. Anunțurile de până acum păstrează
-- comportamentul vechi: apel și, la un număr de mobil, WhatsApp; fără CV pe email.
ALTER TABLE anunturi ADD COLUMN contact_apel INTEGER NOT NULL DEFAULT 1;
ALTER TABLE anunturi ADD COLUMN contact_whatsapp INTEGER NOT NULL DEFAULT 1;
ALTER TABLE anunturi ADD COLUMN whatsapp TEXT;
ALTER TABLE anunturi ADD COLUMN contact_email INTEGER NOT NULL DEFAULT 0;
