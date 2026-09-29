-- Filtrele cerute de proprietar pe 29 septembrie 2026, ca pe OLX și eJobs. Toate trei sunt opționale
-- la postare: un anunț vechi rămâne „nespecificat” (NULL) la contract și la locul muncii.
-- `fara_experienta`: 1 când angajatorul bifează „Nu cer experiență”.
ALTER TABLE anunturi ADD COLUMN fara_experienta INTEGER NOT NULL DEFAULT 0;
-- Perioadă nedeterminată, determinată sau sezonier.
ALTER TABLE anunturi ADD COLUMN contract TEXT CHECK (contract IN ('nedeterminata', 'determinata', 'sezonier'));
-- La sediul angajatorului, hibrid sau de acasă.
ALTER TABLE anunturi ADD COLUMN loc_munca TEXT CHECK (loc_munca IN ('sediu', 'hibrid', 'acasa'));
