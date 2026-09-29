-- Sitemap-ul anunțurilor expirate recent (30 septembrie 2026): fără index, fiecare citire a lui ar
-- parcurge toate anunțurile expirate vreodată, care rămân în bază.
CREATE INDEX anunturi_scoase ON anunturi (stare, expira_la);
