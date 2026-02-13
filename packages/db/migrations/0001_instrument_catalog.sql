-- 0001_instrument_catalog.sql
-- Instrument catalog: markets, symbols, aliases, exchange capabilities.
-- Idempotent: safe to re-run.

-- ---------- markets ----------
CREATE TABLE IF NOT EXISTS markets (
  exchange      TEXT        NOT NULL,
  market_type   TEXT        NOT NULL,
  active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (exchange, market_type)
);

-- ---------- symbols ----------
CREATE TABLE IF NOT EXISTS symbols (
  symbol_norm   TEXT        PRIMARY KEY,
  base_asset    TEXT        NOT NULL,
  quote_asset   TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_symbols_base_quote
  ON symbols (base_asset, quote_asset);

-- ---------- symbol_aliases ----------
CREATE TABLE IF NOT EXISTS symbol_aliases (
  exchange      TEXT    NOT NULL,
  market_type   TEXT    NOT NULL,
  symbol_raw    TEXT    NOT NULL,
  symbol_norm   TEXT    NOT NULL REFERENCES symbols (symbol_norm) ON UPDATE CASCADE,
  PRIMARY KEY (exchange, market_type, symbol_raw)
);

CREATE INDEX IF NOT EXISTS idx_symbol_aliases_norm
  ON symbol_aliases (exchange, market_type, symbol_norm);

-- ---------- exchange_capabilities ----------
CREATE TABLE IF NOT EXISTS exchange_capabilities (
  exchange              TEXT PRIMARY KEY,
  supports_spot         BOOLEAN NOT NULL DEFAULT FALSE,
  supports_linear       BOOLEAN NOT NULL DEFAULT FALSE,
  supports_inverse      BOOLEAN NOT NULL DEFAULT FALSE,
  has_incremental_books BOOLEAN NOT NULL DEFAULT FALSE,
  has_funding           BOOLEAN NOT NULL DEFAULT FALSE,
  has_open_interest     BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
