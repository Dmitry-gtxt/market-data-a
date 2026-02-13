/**
 * Schema version for all event envelopes and WS messages.
 *
 * Backward-compatibility rules:
 * - New fields: add as optional only.
 * - Rename / remove fields: bump SCHEMA_VERSION + migrate all consumers first.
 * - Envelope minimal required fields are frozen at a given version.
 * - Payload may be extended freely (z.unknown()).
 */
export const SCHEMA_VERSION = 1 as const;

export type SchemaVersion = typeof SCHEMA_VERSION;
