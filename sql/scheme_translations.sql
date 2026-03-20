CREATE TABLE IF NOT EXISTS scheme_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_id TEXT NOT NULL
    REFERENCES schemes(id) ON DELETE CASCADE,
  lang TEXT NOT NULL
    CHECK (lang IN
      ('hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn')),
  name TEXT,
  benefit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scheme_id, lang)
);

CREATE INDEX IF NOT EXISTS
  scheme_translations_scheme_id_idx
  ON scheme_translations(scheme_id);

CREATE INDEX IF NOT EXISTS
  scheme_translations_lang_idx
  ON scheme_translations(lang);

ALTER TABLE scheme_translations
  ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scheme_translations'
      AND policyname = 'read_t'
  ) THEN
    CREATE POLICY read_t ON scheme_translations
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scheme_translations'
      AND policyname = 'write_t'
  ) THEN
    CREATE POLICY write_t ON scheme_translations
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
