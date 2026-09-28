-- Hubul de anunțuri de angajare (28 septembrie 2026). Baza: Cloudflare D1, legată în wrangler.jsonc
-- ca DB. Regulile unui anunț: src/lib/anunturi/reguli.ts.
--
-- Datele personale, cât de puține se poate:
--   email          al celui care postează; nu se publică; se șterge la ZILE_PASTRARE_EMAIL după expirare
--   token_hash     SHA-256 al linkului de gestionare; linkul în clar există numai în emailul trimis
--   telefon        contactul angajatorului, publicat cu acordul celui care postează
--   adresa, lat, lon  locul de muncă (al angajatorului), nu al vreunei persoane
--   ip_hash        în limite, SHA-256 cu sare, păstrat 2 zile, numai pentru limita pe zi

CREATE TABLE anunturi (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  stare           TEXT NOT NULL CHECK (stare IN ('neconfirmat', 'activ', 'expirat', 'sters', 'suspendat')),
  titlu           TEXT NOT NULL,
  slug            TEXT NOT NULL,
  meserie         TEXT,                -- slug din catalogul de meserii, NULL = altă meserie
  angajator       TEXT NOT NULL DEFAULT '',   -- opțional: „” când lipsește
  judet           TEXT NOT NULL,
  oras            TEXT NOT NULL,
  oras_slug       TEXT NOT NULL,       -- „cluj-napoca”: /locuri-de-munca/cluj-napoca
  adresa          TEXT,                -- strada și numărul, opțional
  lat             REAL,                -- din adresă (sau din oraș, fără adresă), la publicare;
  lon             REAL,                -- pentru hartă și pentru „sortează după apropiere”
  loc_precizie    TEXT CHECK (loc_precizie IN ('adresa', 'oras')),
  norma           TEXT NOT NULL CHECK (norma IN ('intreaga', 'partiala')),
  ore_pe_zi       INTEGER,
  salariu_min     INTEGER NOT NULL,
  salariu_max     INTEGER,
  baza            TEXT NOT NULL CHECK (baza IN ('brut', 'net')),
  net_min         INTEGER NOT NULL,    -- netul lunar al minimului, pentru filtre și pentru cifrele meseriei
  descriere       TEXT NOT NULL,
  telefon         TEXT,
  email           TEXT,                -- NULL după ștergerea datelor
  token_hash      TEXT NOT NULL,
  creat_la        TEXT NOT NULL,       -- ISO
  confirmat_la    TEXT,
  expira_la       TEXT,
  sters_la        TEXT,
  motiv_suspendare TEXT
);
CREATE INDEX anunturi_lista ON anunturi (stare, confirmat_la DESC);
CREATE INDEX anunturi_meserie ON anunturi (meserie, stare);
CREATE INDEX anunturi_oras ON anunturi (oras_slug, stare);
CREATE UNIQUE INDEX anunturi_token ON anunturi (token_hash);

-- Raportările vizitatorilor (DSA, art. 16): motivul și, opțional, un email pentru răspuns.
CREATE TABLE raportari (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  anunt_id    INTEGER NOT NULL REFERENCES anunturi (id),
  motiv       TEXT NOT NULL,
  detalii     TEXT,
  email       TEXT,
  creat_la    TEXT NOT NULL,
  rezolvat_la TEXT
);
CREATE INDEX raportari_anunt ON raportari (anunt_id);

-- Limita pe zi (anunțuri noi de la același email sau IP). Rândurile mai vechi de 2 zile se șterg.
CREATE TABLE limite (
  cheie    TEXT NOT NULL,              -- 'email:<sha>' sau 'ip:<sha>'
  la       TEXT NOT NULL
);
CREATE INDEX limite_cheie ON limite (cheie, la);
